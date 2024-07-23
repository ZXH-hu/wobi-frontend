import { getAiDialogueUsingPost } from '@/services/yubi/aiDialogueController';
import {Avatar, Button, Card, Col, Form, message, Row,Space, Spin} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import myImage from '../../../public/avatars/aiassistant.jpg';

/**
 * 我的AI助手页面
 * @constructor
 */
const MyAiAssistant: React.FC = () => {
  const [chart, setChart] = useState<API.AiResponse>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    // 对接后端，上传数据
    const params = {
      ...values,
    };
    try {
      const res = await getAiDialogueUsingPost(params);
      if (!res?.data) {
        message.error('AI回答失败');
      } else {
        // 清空输入框内容
        form.resetFields();
        message.success('AI回答成功');
        setChart(res.data);
      }
    } catch (e: any) {
      message.error('分析失败' + e.message);
    }
    setSubmitting(false);
  };

  // 设置AI回答内容一个字一个字的显示
  const [displayedText, setDisplayedText] = useState('');
  const genResult = chart?.genResult;
  // console.log(genResult);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
  
    if (genResult !== undefined && genResult !== null) {
      // 预处理 genResult，去掉首行的多余换行符
      const processedResult = genResult.replace(/^\n+/, '');
  
      setDisplayedText(''); // 清空之前的文本
      let index = 0;
      const addCharacter = () => {
        if (index < processedResult.length) {
          let char = processedResult[index];
          // 保留换行符
          if (char === '\n') {
            setDisplayedText((prev) => prev + '<br />');
          } else {
            setDisplayedText((prev) => prev + char);
          }
          index++;
        } else {
          clearInterval(interval);
          // AI助手回答结束后添加一句话
          setDisplayedText((prev) => prev + '<br /><br />以上为我的思考，希望能帮助到您！');
        }
      };
      // 调节逐字显示速度
      interval = setInterval(addCharacter, 30);
    } else {
      setDisplayedText('请先在左侧向我提问哦~');
    }
  
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [genResult]);

  // 将 HTML 标签渲染为真实的 HTML
  const createMarkup = () => {
    return { __html: displayedText };
  };

  

  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title={
                      // 添加标题和头像
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={myImage} style={{ marginRight: 10 }} />
                        <span>我是您的AI助手小智灵</span>
                      </div>
                    }>
            <Form name="addChart" labelAlign="left" labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }} onFinish={onFinish} initialValues={{}} form={form}>
              <Form.Item
                name="issue"
                label="向AI助手提问"
                rules={[{ required: true, message: '请输入想要询问的内容' }]}
              >
                <TextArea placeholder="请输入您的问题，让我来帮助您解决吧！如：财务数据适合做什么可视化分析..." />
              </Form.Item>
              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    发送
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={
                      // 添加标题和头像
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={myImage} style={{ marginRight: 10 }} />
                        <span>AI助手回答</span>
                      </div>
                    } 
                    style={{width: '100%', position: 'relative'}}>
            {/* {chart?.genResult ?? <div>请先在左侧向我提问哦~</div>} */}
            <div dangerouslySetInnerHTML={createMarkup()} />
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default MyAiAssistant;
