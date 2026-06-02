import { GroupsService } from "./groups.service";

const service = new GroupsService();

export const listGroups = async (req: any, res: any, next: any) => {
  try { res.json(await service.list(req.user!.userId)); } catch (err) { next(err); }
};

export const getGroup = async (req: any, res: any, next: any) => {
  try { res.json(await service.getById(req.params.id, req.user!.userId)); } catch (err) { next(err); }
};

export const createGroup = async (req: any, res: any, next: any) => {
  try { res.status(201).json(await service.create(req.body, req.user!.userId)); } catch (err) { next(err); }
};

export const joinGroup = async (req: any, res: any, next: any) => {
  try { res.json(await service.join(req.params.id, req.user!.userId)); } catch (err) { next(err); }
};

export const leaveGroup = async (req: any, res: any, next: any) => {
  try { res.json(await service.leave(req.params.id, req.user!.userId)); } catch (err) { next(err); }
};

export const createPost = async (req: any, res: any, next: any) => {
  try { res.status(201).json(await service.createPost(req.params.id, req.user!.userId, req.body.content)); } catch (err) { next(err); }
};

export const createComment = async (req: any, res: any, next: any) => {
  try { res.status(201).json(await service.createComment(req.params.postId, req.user!.userId, req.body.content)); } catch (err) { next(err); }
};
