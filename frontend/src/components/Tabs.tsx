import { ReactNode } from 'react'
import cls from 'classnames'

type Tab = { id: string; title: string }
export function Tabs({items, active, onChange}:{items:Tab[], active:string, onChange:(id:string)=>void}){
  return (
    <div className="flex gap-2 border-b">
      {items.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} className={cls("px-3 py-2 -mb-px border-b-2", active===t.id?"border-black font-semibold":"border-transparent text-gray-500")}>
          {t.title}
        </button>
      ))}
    </div>
  )
}