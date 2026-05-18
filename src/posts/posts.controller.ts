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
import { CommentEntity } from "@/posts/entities/comment.entity"
import { LikeEntity } from "@/posts/entities/like.entity"
import { PrismaService } from "@/prisma/prisma.service"

import { PostsService } from "@/posts/posts.service"
import { PostSubject } from "./posts.observer" // Patrón Observer
import { LegacyModerationAdapter } from "./moderation.adapter" // Patrón Adapter
import { PostFactory } from "./posts.factory" // Patrón Factory
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
        private readonly postFactory: PostFactory, // Inyectamos la Fábrica creacional
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        if (body.title.length < 3 || body.title.length > 120) {
            throw new BadRequestException(
                "Title length must be between 3 and 120",
            )
        }

        if (!body.imageUrl.startsWith("http")) {
            throw new BadRequestException("Image URL must start with http")
        }

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

        return {
            total: posts.length,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode || "latest"

        const posts = await this.prisma.post.findMany({
            include: {
                comments: true,
                likes: true,
            },
        })

        // Todo el cálculo feo se fue a la Fábrica Creacional
        const mappedPosts = posts.map((post) => 
            this.postFactory.createFeedEntity(post, mode)
        )

        let sorted = [...mappedPosts]

        switch (mode) {
            case "latest":
                sorted = sorted.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                )
                break
            case "mostLiked":
                sorted = sorted.sort((a, b) => b.likesCount - a.likesCount)
                break
            case "mostCommented":
                sorted = sorted.sort(
                    (a, b) => b.commentsCount - a.commentsCount,
                )
                break
            case "relevance":
                sorted = sorted.sort(
                    (a, b) => b.relevanceScore - a.relevanceScore,
                )
                break
            default:
                sorted = sorted.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                )
                break
        }

        return {
            mode,
            count: sorted.length,
            rows: sorted,
        }
    }

    @Get(":id/comments")
    async getComments(@Param("id", ParseIntPipe) id: number) {
        const post = await this.postsService.findById(id)
        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const comments = await this.prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: "desc" },
        })

        const entities = comments.map(
            (comment) =>
                new CommentEntity(
                    comment.id,
                    comment.postId,
                    comment.content,
                    comment.createdAt,
                    comment.updatedAt,
                    comment.source,
                    "approved",
                    comment.content.length > 80 ? 70 : 45,
                    comment.content.length % 2 === 0,
                    "es",
                    { chars: comment.content.length, source: comment.source },
                ),
        )

        return {
            total_comments: entities.length,
            comments: entities,
        }
    }

    @Post(":id/comments")
    async createComment(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CreateCommentDto,
    ) {
        const post = await this.postsService.findById(id)
        if (!post) {
            throw new NotFoundException("Post not found")
        }

        if (body.content.length < 2) {
            throw new BadRequestException("Comment too short")
        }

        if (this.moderationAdapter.isBlocked(body.content)) {
            throw new BadRequestException("Comment blocked by moderation")
        }

        const created = await this.prisma.comment.create({
            data: {
                postId: id,
                content: body.content,
                source: "controller",
            },
        })

        const entity = new CommentEntity(
            created.id,
            created.postId,
            created.content,
            created.createdAt,
            created.updatedAt,
            created.source,
            "approved",
            created.content.length > 60 ? 80 : 40,
            false,
            "es",
            { moderation: "adapted", source: "legacy" },
        )

        this.postSubject.notify({
            type: "comment",
            postId: id,
            interactionId: created.id,
        })

        return {
            message: "comment_created",
            entity,
        }
    }

    @Post(":id/likes")
    async addLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: AddLikeDto,
    ) {
        const post = await this.postsService.findById(id)
        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const reactionType = body.reactionType || "like"
        const weight = body.weight || 1

        if (weight < 1) {
            throw new BadRequestException("Weight must be at least 1")
        }

        const like = await this.prisma.like.create({
            data: {
                postId: id,
                reactionType,
                weight,
                source: "controller",
            },
        })

        const entity = new LikeEntity(
            like.id,
            like.postId,
            like.reactionType,
            like.weight,
            like.source,
            like.createdAt,
            like.weight > 2 ? "strong" : "normal",
            true,
            { from: "manual", r: like.reactionType },
        )

        this.postSubject.notify({
            type: "like",
            postId: id,
            interactionId: like.id,
            reactionType,
        })

        return {
            success: true,
            like: entity,
        }
    }
}