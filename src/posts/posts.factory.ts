import { Injectable } from '@nestjs/common';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostFactory {
    createFeedEntity(post: any, mode: string): PostEntity {
        const likesCount = post.likes.reduce(
            (sum: number, like: any) => sum + like.weight,
            0,
        );
        const commentsCount = post.comments.length;
        const hoursSinceCreated =
            (Date.now() - new Date(post.createdAt).getTime()) / 36_000_00;
        
        const relevanceScore =
            likesCount * 2 +
            commentsCount * 3 -
            Math.floor(hoursSinceCreated);

        const tags = post.title.split(" ").filter((word: string) => word.length > 4);
        
        const metadata = {
            likesWeights: post.likes.map((like: any) => like.weight),
            commentLengths: post.comments.map(
                (comment: any) => comment.content.length,
            ),
            hourOfCreate: new Date(post.createdAt).getHours(),
        };

        return new PostEntity(
            post.id,
            post.title,
            post.description,
            post.imageUrl,
            post.createdAt,
            post.updatedAt,
            likesCount,
            commentsCount,
            relevanceScore,
            relevanceScore > 20,
            "feed-factory", // Cambiado para reflejar el origen de la creación
            tags,
            metadata,
            mode,
        );
    }
}