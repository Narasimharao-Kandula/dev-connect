import { BookmarkService } from "./bookmarks.service";

const service = new BookmarkService();

export const toggleBookmark = async (req: any, res: any, next: any) => {
  try {
    const result = await service.toggle(req.user.userId, req.params.projectId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBookmarks = async (req: any, res: any, next: any) => {
  try {
    const bookmarks = await service.getUserBookmarks(req.user.userId);
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
};
