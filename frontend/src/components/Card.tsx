import { ReactNode } from 'react'
export default function Card({title, children}:{title?:string, children:ReactNode}){
  return (
    <div className="bg-white border rounded p-4">
      {title && <h3 className="font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  )
}