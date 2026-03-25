import { apiRoot } from '@/lib/ct/client'

export interface StoreChannelData {
  supplyChannelId: string | undefined
  distributionChannelId: string | undefined
  productSelectionId: string | undefined
}

const storeDataCache = new Map<string, StoreChannelData>()

export async function getStoreChannelData(storeKey: string): Promise<StoreChannelData> {
  if (storeDataCache.has(storeKey)) return storeDataCache.get(storeKey)!
  try {
    const { body } = await apiRoot.stores().withKey({ key: storeKey }).get().execute()
    const data: StoreChannelData = {
      supplyChannelId: body.supplyChannels?.[0]?.id,
      distributionChannelId: body.distributionChannels?.[0]?.id,
      productSelectionId: body.productSelections?.[0]?.productSelection?.id,
    }
    storeDataCache.set(storeKey, data)
    return data
  } catch {
    return { supplyChannelId: undefined, distributionChannelId: undefined, productSelectionId: undefined }
  }
}
