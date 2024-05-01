import { FC ,useState , useEffect} from 'react';
import { NavIdProps, Panel, PanelHeader, PanelHeaderBack, Placeholder,Div, Button,CardGrid, ContentCard} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';


interface Story {
  id: number;
  title: string;
  by: string;
  time: number;
}


export const News: FC<NavIdProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const [news, setNews] = useState<Story[]>([]);

  const fetchNews = async () => {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
      const newsIds: number[] = await response.json();
      const latestNewsIds = newsIds.slice(0, 100);
      const newsPromises = latestNewsIds.map(async (id) => {
        const newsResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return newsResponse.json();
      });
      const resolvedNews = await Promise.all(newsPromises);
      const sortedNews = resolvedNews.sort((a, b) => b.time - a.time); // сортировка по времени
      setNews(sortedNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };


  

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        News
      </PanelHeader>
      <Placeholder>
      <Div>
        <h1>Hacker News Top 100</h1>
        <div style={{ marginBottom: 20}}><Button onClick={handleRefresh}>Обновить</Button></div>
        <CardGrid size='m'>
          {news.map((story) => (
            <ContentCard
              key={story.id}
              onClick={() => routeNavigator.push(`/storydetails/${story.id}`)}
              header={`Автор ${story.by} `}
              text={story.title}
              caption={`Дата публикации: ${new Date(story.time * 1000).toLocaleString()}`}
              height='200'
              hoverMode="shadow"
              focusVisibleMode="outline"
            />
          ))}
        </CardGrid>
      </Div>
      </Placeholder>
    </Panel>
  );
};
