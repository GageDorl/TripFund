document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('form[data-validate]').forEach(function(form){
    form.addEventListener('submit', function(e){
      const required = form.querySelectorAll('[required]');
      const errors = [];
      required.forEach(function(field){
        if (!field.value || String(field.value).trim() === '') {
          errors.push((field.getAttribute('aria-label') || field.name || field.id || 'Required field'));
          field.classList.add('input-error');
        } else {
          field.classList.remove('input-error');
        }
      });
      let errorContainer = form.querySelector('.form-errors');
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'form-errors';
        form.insertBefore(errorContainer, form.firstChild);
      }
      if (errors.length) {
        e.preventDefault();
        errorContainer.innerHTML = '<div class="alert"><ul>' + errors.map(function(er){ return '<li>'+er+'</li>'; }).join('') + '</ul></div>';
        const first = form.querySelector('.input-error'); if (first) first.focus();
      } else {
        // allow submit; disable buttons to avoid duplicate posts
        form.querySelectorAll('button').forEach(function(b){ b.disabled = true; });
      }
    });
  });
});
