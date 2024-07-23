import {listMyAiByPageUsingPOST} from '@/services/yubi/chartController';
import {useModel } from '@@/exports';
import {Avatar, Card, List, message, Result} from 'antd';
import React, { useEffect, useState } from 'react';
import Search from "antd/es/input/Search";
import { TinyColor } from '@ctrl/tinycolor';
import { Button, ConfigProvider, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import myImage from '../../../public/avatars/aiassistant.jpg';

/**
 * 我的AI助手历史对话界面
 * @constructor
 */
const MyAiAssistantHistory: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 2,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.AiAssistantQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.AiAssistant[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 按钮颜色
  const colors2 = ['#4888C4', '#8EC5FC', '#7EB8F1', '#4EA4F3'];
  const getHoverColors = (colors: string[]) =>
  colors.map((color) => new TinyColor(color).lighten(5).toString());
  const getActiveColors = (colors: string[]) =>
  colors.map((color) => new TinyColor(color).darken(5).toString());

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyAiByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const resultContent = data.genResult ?? '';
              data.genResult = resultContent;
            }
          })
        }
      } else {
        message.error('获取历史对话记录失败');
      }
    } catch (e: any) {
      message.error('获取历史对话记录失败，' + e.message);
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
      await apiClient.post('/api/aide/delete/', { id: chartId });
      // 这里可以添加其他删除成功后的逻辑，比如刷新列表
      loadData();
      message.success('记录删除成功');
    } catch (error) {
      message.error('记录删除失败');
    }
  };

  return (
    <div className="my-chart-page">
      <div>
        <Search placeholder="请输入历史问题" enterButton loading={loading} onSearch={(value) => {
          // 设置搜索条件
          setSearchParams({
            ...initSearchParams,
            issue: value,
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
            <Card style={{ width: '100%', height: 550, position: 'relative' }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={"我的询问：" + item.issue}
              />
                <div style={{ position: 'relative' }}>
                        <Space style={{ position: 'absolute', top: -45, right: 10 }}>
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
                      <div style={{ maxHeight: '439px', overflowY: 'auto', paddingTop: '16px' }}>
                        {
                          item.status === 'succeed' && <>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={myImage} style={{ marginRight: 10 }} />
                            <span>小智灵：</span>
                          </div>
                              {item.genResult}
                          </>
                        }
                        {
                          item.status === 'failed' && <>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={myImage} style={{ marginRight: 10 }} />
                            <span>小智灵：非常抱歉~请重试！</span>
                          </div>
                            <Result
                              status="error"
                              title="Ai回答失败"
                              subTitle={item.execMessage}
                            />
                          </>
                        }
                      </div>
            </Card>
        </List.Item>
        )}
      />
    </div>
  );
};
export default MyAiAssistantHistory;
