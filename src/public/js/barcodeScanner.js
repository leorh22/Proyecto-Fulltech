document.addEventListener('DOMContentLoaded', () => {
    const numSerieInput = document.getElementById('num_serie');
  
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        return false; 
      }
  
      if (event.target !== numSerieInput) {
        if (!event.target.id.startsWith('barcode-input-')) {
          const barcodeInput = document.createElement('input');
          barcodeInput.type = 'text';
          barcodeInput.id = 'barcode-input-' + Date.now();
          barcodeInput.style.position = 'absolute';
          barcodeInput.style.left = '-1000px';
          document.body.appendChild(barcodeInput);
  
          barcodeInput.addEventListener('input', (event) => {
            const barcode = event.target.value;
            if (barcode) {
              numSerieInput.value = barcode; // Insertar el código de barras en el campo num_serie
              event.target.remove(); // Eliminar el campo de entrada temporal después de leer el código
            }
          });
  
          barcodeInput.focus();
        }
      }
    });
  });