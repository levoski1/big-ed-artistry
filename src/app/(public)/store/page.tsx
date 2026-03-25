'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import ProductCard from '@/components/ui/ProductCard'
import { PageHero } from '@/components/ui'
import { mockProducts } from '@/lib/mockData'

const categories = ['All','print','canvas','bundle','frame']

export default function StorePage() {
  const [active, setActive] = useState('All')
  const filtered = active==='All' ? mockProducts : mockProducts.filter(p=>p.category===active)
  return (
    <PublicLayout>
      <PageHero tag="Store" title={<>Art Products <span style={{color:'var(--gold-light)',fontStyle:'italic'}}>&amp; Prints</span></>} subtitle="Browse portrait prints, canvas wraps, frames, and bundles — each with ratings and direct cart ordering."/>
      <div style={{padding:'36px 0',borderBottom:'1px solid var(--border-color)',background:'var(--bg-card)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {categories.map(cat=>(
              <button key={cat} onClick={()=>setActive(cat)} style={{padding:'9px 20px',fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',background:active===cat?'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))':'transparent',color:active===cat?'var(--text-on-gold)':'var(--text-secondary)',border:active===cat?'none':'1px solid var(--border-color)',cursor:'pointer',fontFamily:'"Libre Franklin",sans-serif',fontWeight:active===cat?600:400,transition:'all 0.2s'}}>
                {cat==='All'?'All Products':cat.charAt(0).toUpperCase()+cat.slice(1)}
              </button>
            ))}
          </div>
          <div style={{fontSize:13,color:'var(--text-muted)'}}>{filtered.length} products</div>
        </div>
      </div>
      <section style={{padding:'60px 0 100px'}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}} className="store-grid">
            {filtered.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.store-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.store-grid{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
