import Home from '../pages/home-page';
import About from '../pages/about-page';

import Login from '../pages/login-page';
import Register from '../pages/register-page';
import AddStory from '../pages/add-story-page';

const routes = {
  '/': Home,
  '/home': Home,
  '/about': About,
  '/login': Login,
  '/register': Register,
  '/add': AddStory,
};

export default routes;
