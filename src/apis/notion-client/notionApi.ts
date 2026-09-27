import { NotionAPI } from "notion-client"

// 2026-02부터 Notion이 레코드를 { value: { value, role } } 로 한 겹 더 감싸서 준다.
// notion-client 6.x 의 getPage 는 block.value.type / block.value.content 를 읽기 때문에
// 감싼 그대로면 컬렉션 조회와 하위 블록 조회를 통째로 건너뛴다(collection_query 가 {} 가 된다).
// 모든 응답이 지나가는 fetch 에서 한 겹을 벗겨 getPage 의 나머지 로직이 원래대로 돌게 한다.
const RECORD_TABLES = [
  "block",
  "collection",
  "collection_view",
  "notion_user",
  "space",
] as const

const unwrapRecordMap = (recordMap: any) => {
  if (!recordMap) return
  RECORD_TABLES.forEach((table) => {
    const records = recordMap[table]
    if (!records) return
    Object.values(records).forEach((record: any) => {
      const inner = record?.value?.value
      if (inner && typeof inner === "object" && "id" in inner) {
        record.value = inner
      }
    })
  })
}

// Notion 이 got 의 기본 User-Agent("got (https://github.com/sindresorhus/got)")를 403 으로 막는다.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"

export class NormalizedNotionAPI extends NotionAPI {
  async fetch<T>(args: Parameters<NotionAPI["fetch"]>[0]): Promise<T> {
    const response: any = await super.fetch<T>({
      ...args,
      headers: { "user-agent": USER_AGENT, ...args.headers },
    })
    unwrapRecordMap(response?.recordMap)
    unwrapRecordMap(response?.recordMapWithRoles)
    return response
  }
}
