import {
    BadRequestException,
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { PostsService } from "@/posts/posts.service"
import { PostSubject } from "./posts.observer"
import { LegacyModerationAdapter } from "./moderation.adapter"
import { PostFactory } from "./posts.factory"
import {
    AddLikeDto,
    CreateCommentDto,
    CreatePostDto,
    FeedQueryDto,
} from "@/posts/posts.dtos"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly prisma: PrismaService,
        private readonly postSubject: PostSubject,
        private readonly moderationAdapter: LegacyModerationAdapter,
        private readonly postFactory: PostFactory,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        // Validaciones manuales eliminadas. Delegadas a class-validator.
        const created = await this.postsService.create(body)

        this.postSubject.notify({
            type: "post",
            postId: created.id,
            interactionId: created.id,
        })

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.postsService.findAll()
        return { total: posts.length, items: posts }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode || "latest"

        const posts = await this.prisma.post.findMany({
            include: { comments: true, likes: true },
        })

        const mappedPosts = posts.map((post) =>
            this.postFactory.createFeedEntity(post, mode)
        )

        let sorted = [...mappedPosts]

        // Este bloque permanece intacto temporalmente.
        // Se extraerá en tu propia rama aplicando el Patrón Strategy.
        switch (mode) {
            case "latest":
                sorted = sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                break
            case "mostLiked":
                sorted = sorted.sort((a, b) => b.likesCount - a.likesCount)
                break
            case "mostCommented":
                sorted = sorted.sort((a, b) => b.commentsCount - a.commentsCount)
                break
            case "relevance":
                sorted = sorted.sort((a, b) => b.relevanceScore - a.relevanceScore)
                break
            default:
                sorted = sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                break
        }

        return { mode, count: sorted.length, rows: sorted }
    }

    @Get(":id/comments")
    async getComments(@Param("id", ParseIntPipe) id: number) {
        const post = await this.postsService.findById(id)
        if (!post) throw new NotFoundException("Post not found")

        const comments = await this.prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: "desc" },
        })

        // Instanciación delegada a la Fábrica
        const entities = comments.map(comment => this.postFactory.createCommentEntity(comment))

        return { total_comments: entities.length, comments: entities }
    }

    @Post(":id/comments")
    async createComment(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CreateCommentDto,
    ) {
        const post = await this.postsService.findById(id)
        if (!post) throw new NotFoundException("Post not found")

        if (this.moderationAdapter.isBlocked(body.content)) {
            throw new BadRequestException("Comment blocked by moderation")
        }

        const created = await this.prisma.comment.create({
            data: { postId: id, content: body.content, source: "controller" },
        })

        // Instanciación delegada a la Fábrica
        const entity = this.postFactory.createCommentEntity(created, "adapted")

        this.postSubject.notify({
            type: "comment",
            postId: id,
            interactionId: created.id,
        })

        return { message: "comment_created", entity }
    }

    @Post(":id/likes")
    async addLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: AddLikeDto,
    ) {
        const post = await this.postsService.findById(id)
        if (!post) throw new NotFoundException("Post not found")

        const reactionType = body.reactionType || "like"
        const weight = body.weight || 1

        const like = await this.prisma.like.create({
            data: { postId: id, reactionType, weight, source: "controller" },
        })

        // Instanciación delegada a la Fábrica
        const entity = this.postFactory.createLikeEntity(like)

        this.postSubject.notify({
            type: "like",
            postId: id,
            interactionId: like.id,
            reactionType,
        })

        return { success: true, like: entity }
    }
}
