export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' },{ path: '/user/register', component: './User/Register' }] },
  { path: '/', redirect: '/chart/add_chart' },
  { path: '/chart/add_chart', name: '智能数据分析', icon: 'barChart', component: './AddChart' },
  { path: '/ai&bi/ai_assistant', name: 'AI助手小智灵', icon: 'aliwangwangOutlined', component: './AIDialogue' },
  { path: '/chart/add_chart_async', name: '异步智链', icon: 'riseOutlined', component: './AddChartAsync' },
  { path: '/chart/my_chart', name: '我的图表', icon: 'pieChart', component: './MyChart' },
  { path: '/ai&bi/ai_history', name: 'AI助手历史记录', icon: 'commentOutlined', component: './AIDialogueHistory' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
