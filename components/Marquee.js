import React from 'react'

function Marquee() {
  const currentDate = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return (
<div className="marquee bg-black py-2">
  <div className="marquee-inner overflow-hidden">
    <div className="marquee-content text-center text-white  ">
      <span className="inline-block px-4">Welcome to RJ Mumbai Satta! Get daily results and charts for RJ Mumbai Satta, including Super Dubai, Super Faridabad, Delhi Bazar, Shri Ganesh, Faridabad, GHAZIABAD, Gali, and Desawar. Stay updated and gamble responsibly. Enjoy the thrill of RJ Mumbai Satta!</span>
      {/* <span className="inline-block px-4"></span>
      <span className="inline-block px-4"></span> */}
    </div>
  </div>
</div>

  )
}

export default Marquee