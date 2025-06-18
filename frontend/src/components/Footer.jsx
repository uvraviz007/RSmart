import React from 'react'

function Footer() {
  return (
    <div>
      <footer className="mt-10 py-6 text-center border-t border-cyan-700 bg-black bg-opacity-40">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto px-4">
            <div className="text-cyan-400 font-semibold text-lg mb-2 md:mb-0">
              © {new Date().getFullYear()} RSmart. All rights reserved.
            </div>
            
            <div className="flex gap-4">
              <a
                href="mailto:support@rsmart.com"
                className="text-white hover:text-cyan-400 transition duration-300"
              >
                Contact
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-cyan-400 transition duration-300"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
    </div>
  )
}

export default Footer
