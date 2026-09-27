import { NormalizedNotionAPI } from "src/apis/notion-client/notionApi"

export const getRecordMap = async (pageId: string) => {
  const api = new NormalizedNotionAPI()
  const recordMap = await api.getPage(pageId)
  return recordMap
}
