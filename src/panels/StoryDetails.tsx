import { FC , useState , useEffect} from 'react';
import { NavIdProps, Panel, PanelHeader, PanelHeaderBack, Placeholder,Div, Button,CardGrid, ContentCard} from '@vkontakte/vkui';
import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Comment } from '../components/Comment'



interface Story {
  id: number;
  title: string;
  by: string;
  time: number;
  kids?: number[];
}



export const StoryDetails: FC< NavIdProps> = ( { id } ) => {
  const routeNavigator = useRouteNavigator();
  const [story, setStory] = useState<Story>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState<number[]>([]);
  const params = useParams<'id'>();

  const fetchStory = async () => {
    try {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${params.id}.json`);
      const storyData = await storyResponse.json();
      setStory(storyData);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchComments = async () => {
    try {
      if (story && story.kids) {
        const commentsPromises = story.kids.map(async (commentId: number) => {
          const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
          return commentResponse.json();
        });
        const resolvedComments = await Promise.all(commentsPromises);
        setComments(resolvedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const loadReplies = async (commentId: number) => {
    try {
      const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
      const commentData = await commentResponse.json();
      if (commentData.kids) {
        const replyPromises = commentData.kids.map(async (replyId: number) => {
          const replyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${replyId}.json`);
          return replyResponse.json();
        });
        const resolvedReplies = await Promise.all(replyPromises);
        setComments((prevComments) => [
          ...prevComments,
          ...resolvedReplies.filter((reply) => !prevComments.some((c) => c.id === reply.id)),
        ]);
        setShowReplies((prevShowReplies) => [...prevShowReplies, commentId]);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  useEffect(() => {
    fetchStory();
  }, [params]);

  useEffect(() => {
    fetchComments();
  }, [story]);

  useEffect(() => {
    const intervalId = setInterval(() => { fetchComments(); }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefreshComments = () => {
    fetchComments();
  };

  
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Story Details
        </PanelHeader>
        {story ? (
          <CardGrid size="l">
            <ContentCard
              header={`Автор: ${story.by}`}
              text={story.title}
              caption={`Количество комментариев: ${comments.length}    Дата публикации: ${new Date(story.time * 1000).toLocaleString()}`}
              height={1000}
              hoverMode="shadow"
              focusVisibleMode="outline"
            />
          </CardGrid>
        ) : (
          <Placeholder>Загрузка...</Placeholder>
        )}
        <Div>
          <Button size="m" onClick={handleRefreshComments}>
            Обновить комментарии
          </Button>
        </Div>
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} showReplies={showReplies} loadReplies={loadReplies} />
        ))}
      
      </Panel>
  );
};


