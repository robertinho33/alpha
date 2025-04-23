document.addEventListener('DOMContentLoaded', () => {
  const cnpjInput = document.getElementById('cnpj');
  if (cnpjInput) {
    IMask(cnpjInput, {
      mask: '00.000.000/0000-00'
    });
  }

  const telefoneComercialInput = document.getElementById('telefoneComercial');
  if (telefoneComercialInput) {
    IMask(telefoneComercialInput, {
      mask: '(00) 00000-0000'
    });
  }

  const telefoneGestorInput = document.getElementById('telefoneGestor');
  if (telefoneGestorInput) {
    IMask(telefoneGestorInput, {
      mask: '(00) 00000-0000'
    });
  }

  const telefoneColaboradorInput = document.getElementById('telefoneColaborador');
  if (telefoneColaboradorInput) {
    IMask(telefoneColaboradorInput, {
      mask: '(00) 00000-0000'
    });
  }
});