import {listMyChartByPageUsingPOST } from '@/services/yubi/chartController';
import {useModel } from '@@/exports';
import {Avatar, Card, Drawer, List, message, Modal, Result} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';
import Search from "antd/es/input/Search";
import { TinyColor } from '@ctrl/tinycolor';
import { Button, ConfigProvider, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState(false);

  // 按钮颜色
  const colors3 = ['#6253E1', '#04BEFE'];
  const colors2 = ['#4888C4', '#8EC5FC', '#7EB8F1', '#4EA4F3'];
  const colors1 = ['#40e495', '#30dd8a', '#2bb673'];
  const getHoverColors = (colors: string[]) =>
  colors.map((color) => new TinyColor(color).lighten(5).toString());
  const getActiveColors = (colors: string[]) =>
  colors.map((color) => new TinyColor(color).darken(5).toString());

  // 动态展示分析结论弹出框
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
              // console.log(data.genResult)
            }
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // 使用 axios 配置后端的 baseURL
const apiClient = axios.create({
  baseURL: 'http://47.115.230.253:8101',
  withCredentials: true,
});

  // 传递删除图表id到后端
  const deleteChart = async (chartId) => {
    try {
      await apiClient.post('/api/chart/delete/', { id: chartId });
      // 这里可以添加其他删除成功后的逻辑，比如刷新列表
      loadData();
      message.success('图表删除成功');
    } catch (error) {
      message.error('图表删除失败');
    }
  };

  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {
          // 设置搜索条件
          setSearchParams({
            ...initSearchParams,
            name: value,
          })
        }} style={{width: 600}}/>
      </div>
      <div className="margin-16" />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
          <Card style={{ width: '100%', position: 'relative' }}>
            <List.Item.Meta
              avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
              title={item.name}
              description={item.chartType ? '图表类型：' + item.chartType : undefined}
            />
            <>
              {
                item.status === 'wait' && <>
                  <Result
                    status="warning"
                    title="待生成"
                    subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                  />
                </>
              }
              {
                item.status === 'running' && <>
                  <Result
                    status="info"
                    title="图表生成中"
                    subTitle={item.execMessage}
                  />
                </>
              }
              {
                item.status === 'succeed' && <>
                  <div style={{ marginBottom: 16 }} />
                  <p>{'分析目标：' + item.goal}</p>
                  <div style={{ marginBottom: 16 }} />
                  {/* 分析结论弹出框 */}
                  <Drawer
                  title="分析结论"
                  placement="right"
                  closable={true}
                  onClose={onClose}
                  visible={visible}
                  maskStyle={{ backgroundColor: 'rgba(200, 200, 200, 0.3)', overflowY: 'auto' }} // 设置遮罩层的背景色和透明度
                  style={{ zIndex: 1000 }}
                >
                  <p>{item.genResult}</p>
                </Drawer>
                  <div style={{ position: 'relative' }}>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                    <Space style={{ position: 'absolute', top: -103, right: 10 }}>
                      <ConfigProvider
                        theme={{
                          components: {
                            Button: {
                              colorPrimary: `linear-gradient(135deg, ${colors3.join(', ')})`,
                              colorPrimaryHover: `linear-gradient(135deg, ${getHoverColors(colors3).join(', ')})`,
                              colorPrimaryActive: `linear-gradient(135deg, ${getActiveColors(colors3).join(', ')})`,
                              lineWidth: 0,
                            },
                          },
                        }}
                      >
                        <Button type="primary" size="middle" onClick={showDrawer}>
                          分析结论
                        </Button>
                      </ConfigProvider>
                      <ConfigProvider
                        theme={{
                          components: {
                            Button: {
                              colorPrimary: `linear-gradient(90deg,  ${colors2.join(', ')})`,
                              colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colors2).join(', ')})`,
                              colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colors2).join(', ')})`,
                              lineWidth: 0,
                            },
                          },
                        }}
                      >
                        <Button type="primary" 
                        size="middle" 
                        htmlType="submit"
                        icon={<DeleteOutlined />} onClick={() => deleteChart(item.id)}>
                          删除
                        </Button>
                      </ConfigProvider>
                    </Space>
                  </div>
                </>
              }
              {
                item.status === 'failed' && <>
                  <Result
                    status="error"
                    title="图表生成失败"
                    subTitle={item.execMessage}
                  />
                  <Space style={{ position: 'absolute', top: 20, right: 30 }}>
                      <ConfigProvider
                        theme={{
                          components: {
                            Button: {
                              colorPrimary: `linear-gradient(90deg,  ${colors2.join(', ')})`,
                              colorPrimaryHover: `linear-gradient(90deg, ${getHoverColors(colors2).join(', ')})`,
                              colorPrimaryActive: `linear-gradient(90deg, ${getActiveColors(colors2).join(', ')})`,
                              lineWidth: 0,
                            },
                          },
                        }}
                      >
                        <Button type="primary" 
                        size="middle" 
                        htmlType="submit"
                        icon={<DeleteOutlined />} onClick={() => deleteChart(item.id)}>
                          删除
                        </Button>
                      </ConfigProvider>
                    </Space>
                </>
              }
            </>
          </Card>
        </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
