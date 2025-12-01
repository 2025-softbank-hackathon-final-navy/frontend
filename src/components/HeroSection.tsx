const metaphors = [
  { icon: 'fa-scroll', title: 'Recipe', tech: 'Code Function' },
  { icon: 'fa-receipt', title: 'Order', tech: 'HTTP Request' },
  { icon: 'fa-kitchen-set', title: 'Cookware', tech: 'Docker Container' },
  { icon: 'fa-fire-burner', title: 'Stove', tech: 'EC2 Instance' },
  { icon: 'fa-temperature-arrow-up', title: 'Pre-heat', tech: 'Cold Start' },
]

export function HeroSection() {
  return (
    <section id="concept" className="text-center space-y-6 pt-10">
      <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-2">
        Hackathon Project Proposal
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight">
        내 코드가 <span className="text-amber-600 relative">요리<span className="absolute bottom-0 left-0 w-full h-2 bg-amber-200 opacity-30 -z-10"></span></span>가 되는 곳
      </h1>
      <p className="text-xl md:text-2xl text-stone-500 max-w-3xl mx-auto font-light">
        EC2 위에 직접 구축하는 맛있는 서버리스 키친, <br />
        <strong>Code Bistro</strong>에 오신 것을 환영합니다.
      </p>
      
      <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600"></div>
        <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          <i className="fa-solid fa-utensils text-stone-400"></i>
          The Kitchen Metaphor
        </h3>
        <p className="mb-8 text-stone-600">서버리스(Serverless)의 복잡한 기술을 직관적인 주방 언어로 재해석했습니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metaphors.map((item) => (
            <div 
              key={item.title}
              className="bg-stone-50 p-6 rounded-xl border border-stone-200 hover-lift transition-all-300 group cursor-pointer"
            >
              <div className="text-3xl mb-3 text-amber-500 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <h4 className="font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-stone-500 mb-2 font-mono bg-stone-200 inline-block px-2 py-1 rounded">
                {item.tech}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

