import { Injectable } from '@nestjs/common';
import { Post, Comment, Like } from '@prisma/client';
import { PostEntity } from './entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { LikeEntity } from './entities/like.entity';

type PostWithRelations = Post & { comments: Comment[]; likes: Like[] };

@Injectable()
export class PostFactory {

    createFeedEntity(post: PostWithRelations, mode: string): PostEntity {
        const likesCount = post.likes.reduce((sum, like) => sum + like.weight, 0);
        const commentsCount = post.comments.length;
        const hoursSinceCreated = (Date.now() - post.createdAt.getTime()) / 3600000;

        const relevanceScore = likesCount * 2 + commentsCount * 3 - Math.floor(hoursSinceCreated);
        const tags = post.title.split(" ").filter((word: string) => word.length > 4);

        const metadata = {
            likesWeights: post.likes.map(like => like.weight),
            commentLengths: post.comments.map(comment => comment.content.length),
            hourOfCreate: post.createdAt.getHours(),
        };

        return new PostEntity(
            post.id, post.title, post.description, post.imageUrl,
            post.createdAt, post.updatedAt, likesCount, commentsCount,
            relevanceScore, relevanceScore > 20, "feed-factory", tags, metadata, mode
        );
    }

    createCommentEntity(comment: Comment, moderationStatus: string = "approved"): CommentEntity {
        const metadata = {
            chars: comment.content.length,
            source: comment.source,
            moderation: moderationStatus === "approved" ? "standard" : "adapted"
        };

        return new CommentEntity(
            comment.id, comment.postId, comment.content, comment.createdAt,
            comment.updatedAt, comment.source, moderationStatus,
            comment.content.length > 80 ? 70 : 45,
            comment.content.length % 2 === 0, "es", metadata
        );
    }

    createLikeEntity(like: Like): LikeEntity {
        const metadata = { from: "manual", r: like.reactionType };

        return new LikeEntity(
            like.id, like.postId, like.reactionType, like.weight,
            like.source, like.createdAt,
            like.weight > 2 ? "strong" : "normal",
            true, metadata
        );
    }
}
