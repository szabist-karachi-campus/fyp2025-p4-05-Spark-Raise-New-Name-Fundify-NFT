import { createCampaign, home, dashboard, logout, payment, profile, withdraw } from '../assets';

export const navlinks = [
  {
    name: 'dashboard',
    imgUrl: home,
    link: '/dashboard',
  },
  {
    name: 'campaigns',
    imgUrl: dashboard,
    link: '/campaigns',
  },
  {
    name: 'campaign',
    imgUrl: createCampaign,
    link: '/create-campaign',
  },
  // {
  //   name: 'payment',
  //   imgUrl: payment,
  //   link: '/',
  //   disabled: true,
  // },
  // {
  //   name: 'withdraw',
  //   imgUrl: withdraw,
  //   link: '/',
  //   disabled: true,
  // },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/logout',
  },
];
