import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/rank',
      name: 'rank',
      component: () => import('../views/RankView.vue'),
    },
    {
      path: '/artist',
      name: 'artist',
      component: () => import('../views/ArtistView.vue'),
    },
    {
      path: '/artist/:id',
      name: 'artist-detail',
      component: () => import('../views/ArtistDetailView.vue'),
    },
    {
      path: '/playlist/:id',
      name: 'playlist',
      component: () => import('../views/PlaylistView.vue'),
    },
    {
      path: '/mv',
      name: 'mv',
      component: () => import('../views/MvView.vue'),
    },
    {
      path: '/dj',
      name: 'dj',
      component: () => import('../views/DjView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
    },
  ],
});

export default router;