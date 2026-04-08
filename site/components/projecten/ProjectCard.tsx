import { useLocale } from "@/context/LocaleContext"
import { usePurchaseListMutations } from "@/hooks/usePurchaseLists"
import { Cart, Order, ShoppingList } from "@commercetools/platform-sdk"
import Link from "next/link"
import { redirect } from "next/navigation"

export interface ProjectCardProps {
    shoppingList: ShoppingList
    order?: Order
    cart?: Cart
}

export default function ProjectCard({ shoppingList, order, cart }: ProjectCardProps) {
    const { deleteList } = usePurchaseListMutations()
    const remove = (list: ShoppingList) => {
        deleteList(list.id, list.version)
        redirect('/dashboard/projecten')
    }
    const edit = (list: ShoppingList) => {
        redirect(`/dashboard/projecten/${list.id}`)
    }
    const locale = useLocale()
    const name = shoppingList.name[locale.locale] || shoppingList.name['nl-NL']
    const description = shoppingList.description?.[locale.locale] || shoppingList.description?.['nl-NL']

    const skuCount = shoppingList.lineItems.length
    const totalPrice = shoppingList.lineItems.reduce((acc, item) => acc + item?.variant?.price?.value.centAmount!, 0)
    const createdAt = shoppingList.createdAt

    return (
        <div className="group bg-white hover:bg-blue-50/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 border-transparent hover:border-primary">
            <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-1">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                </div>
                <div className="col-span-11 lg:col-span-4">
                    <Link href={`/dashboard/projecten/${shoppingList.id}`} className="flex items-center gap-3 group/link cursor-pointer hover:underline decoration-primary">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">plumbing</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-on-surface">{name}</h3>
                            {description && <p className="text-xs text-outline">{description}</p>}
                        </div>
                    </Link></div>
                <div className="hidden lg:block lg:col-span-2 text-center">
                    <span className="bg-surface-container-low px-3 py-1 rounded-full text-xs font-bold">{skuCount} SKU</span>
                </div>
                <div className="hidden lg:block lg:col-span-2 text-right font-bold text-primary">
                    € {totalPrice}
                </div>
                <div className="col-span-6 lg:col-span-3 flex flex-col items-end">
                    <span className="text-sm font-medium">{Intl.DateTimeFormat('nl-NL', { dateStyle: 'short' }).format(new Date(createdAt))}</span>
                    <div className="flex gap-2 mt-2">
                        <Link href={`/dashboard/projecten/${shoppingList.id}`} className="p-1 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-lg">edit</span></Link>
                        <button className="p-1 hover:text-primary transition-colors" title="Share"><span className="material-symbols-outlined text-lg">share</span></button>
                        <button className="p-1 hover:text-primary transition-colors" title="Duplicate"><span className="material-symbols-outlined text-lg">content_copy</span></button>
                        <button className="p-1 hover:text-error transition-colors" title="Delete" onClick={() => remove(shoppingList)}><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                </div>
            </div>
        </div>
    )
}