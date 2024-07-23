// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** getAiDialogue POST /api/aide/assistant */
export async function getAiDialogueUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAiDialogueUsingPOSTParams,
  
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseAiResponse_>('/api/aide/assistant', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
