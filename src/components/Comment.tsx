import { FC, useState, useEffect } from 'react';
import { ContentCard ,Div} from '@vkontakte/vkui';

export interface Comment {
  id: number;
  text: string;
  by: string;
  time: number;
  kids?: number[];
}


export const Comment: FC<{ comment: Comment, showReplies: number[], loadReplies: (commentId: number) => void }> = ({ comment, showReplies, loadReplies }) => {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);

  const handleLoadReplies = (commentId: number) => {
    if (!isRepliesVisible) {
      loadReplies(commentId);
      setIsRepliesVisible(true);
    } else {
      setIsRepliesVisible(false);
    }
  };

  useEffect(() => {
    if (isRepliesVisible && comment.kids) {
      const fetchReplies = async () => {
        const replyPromises = comment.kids.map(async (replyId: number) => {
          const replyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${replyId}.json`);
          return replyResponse.json();
        });
        const resolvedReplies = await Promise.all(replyPromises);
        setReplies(resolvedReplies);
      };
      fetchReplies();
    }
  }, [isRepliesVisible, comment]);

  const commentCaption = comment.kids && comment.kids.length > 0
    ? `Количество ответов: ${comment.kids.length}     Дата публикации: ${new Date(comment.time * 1000).toLocaleString()}`
    : `Дата публикации: ${new Date(comment.time * 1000).toLocaleString()}`;

  return (
    <Div >
        <div>
            <ContentCard
                header={`Автор: ${comment.by}`}
                text={comment.text}
                caption={commentCaption}
                onClick={() => handleLoadReplies(comment.id)}
                hoverMode="shadow"
                focusVisibleMode="outline"
            />
        </div>
      {isRepliesVisible && replies.length > 0 && (
        <div style={{ marginLeft: 20}}>
          {replies.map(reply => (
            <Comment key={reply.id} comment={reply} showReplies={showReplies} loadReplies={loadReplies} />
          ))}
        </div>
      )}
    </Div>
  );
};