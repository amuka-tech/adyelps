export function showToast(message: string = "Feature coming soon. This feature is currently in development.", type: 'info' | 'success' | 'error' = 'info') {
  if (typeof window === 'undefined') return;
  
  // Create container if it doesn't exist
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  
  // Styling based on type
  let bgClass = 'bg-gray-900 text-white';
  let icon = `<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  
  if (type === 'success') {
    bgClass = 'bg-green-50 text-green-800 border border-green-200';
    icon = `<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>`;
  } else if (type === 'error') {
    bgClass = 'bg-red-50 text-red-800 border border-red-200';
    icon = `<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  } else {
    bgClass = 'bg-white text-gray-800 border border-gray-200 shadow-xl';
    icon = `<svg className="w-5 h-5 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-y-8 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    ${icon}
    <p class="text-sm font-medium m-0 leading-tight">${message}</p>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-8', 'opacity-0');
  });

  // Animate out and remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => {
      toast.remove();
      // Cleanup container if empty
      if (container && container.childNodes.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}
