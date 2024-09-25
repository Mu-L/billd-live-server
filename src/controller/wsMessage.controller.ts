import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import { COMMON_HTTP_CODE, MSG_MAX_LENGTH, REDIS_PREFIX } from '@/constant';
import { IList, IWsMessage } from '@/interface';
import { CustomError } from '@/model/customError.model';
import wsMessageService from '@/service/wsMessage.service';

import redisController from './redis.controller';

class WsMessageController {
  common = {
    create: ({
      msg_type,
      live_room_id,
      user_id,
      ip,
      content_type,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    }: IWsMessage) => {
      if (content && content?.length > MSG_MAX_LENGTH) {
        throw new CustomError(
          `消息长度最大${MSG_MAX_LENGTH}！`,
          COMMON_HTTP_CODE.paramsError,
          COMMON_HTTP_CODE.paramsError
        );
      }
      return wsMessageService.create({
        msg_type,
        live_room_id,
        user_id,
        ip,
        content_type,
        content,
        origin_content,
        username,
        origin_username,
        user_agent,
        send_msg_time,
        redbag_send_id,
        is_show,
        is_verify,
      });
    },
    find: (id: number) => wsMessageService.find(id),
    updateIsShow: ({ id, is_show }: IWsMessage) =>
      wsMessageService.update({ id, is_show }),
    getList: async ({
      msg_type,
      redbag_send_id,
      live_room_id,
      user_id,
      ip,
      is_show,
      is_verify,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IWsMessage>) => {
      try {
        const oldCache = await redisController.getVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
        });
        if (oldCache) {
          return JSON.parse(oldCache).value;
        }
      } catch (error) {
        console.log(error);
      }
      const result = await wsMessageService.getList({
        msg_type,
        redbag_send_id,
        live_room_id,
        user_id,
        ip,
        is_show,
        is_verify,
        orderBy,
        orderName,
        nowPage,
        pageSize,
        keyWord,
        rangTimeType,
        rangTimeStart,
        rangTimeEnd,
      });
      try {
        redisController.setExVal({
          prefix: REDIS_PREFIX.dbLiveRoomHistoryMsgList,
          key: `${live_room_id!}`,
          value: result,
          exp: 3,
        });
      } catch (error) {
        console.log(error);
      }
      return result;
    },
  };

  async update(ctx: ParameterizedContext, next) {
    const {
      id,
      msg_type,
      live_room_id,
      user_id,
      ip,
      content_type,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    }: IWsMessage = ctx.request.body;

    const res = await wsMessageService.update({
      id,
      msg_type,
      live_room_id,
      user_id,
      ip,
      content_type,
      content,
      origin_content,
      username,
      origin_username,
      user_agent,
      send_msg_time,
      redbag_send_id,
      is_show,
      is_verify,
    });
    successHandler({ ctx, data: res });
    await next();
  }

  getList = async (ctx: ParameterizedContext, next) => {
    const data = ctx.request.query;
    const result = await this.common.getList(data);
    successHandler({ ctx, data: result });
    await next();
  };

  find = async (ctx: ParameterizedContext, next) => {
    const id = +ctx.params.id;
    const result = await this.common.find(id);
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await wsMessageService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的消息！`,
        COMMON_HTTP_CODE.paramsError,
        COMMON_HTTP_CODE.paramsError
      );
    }
    await wsMessageService.delete(id);
    successHandler({ ctx });
    await next();
  }
}

export default new WsMessageController();
