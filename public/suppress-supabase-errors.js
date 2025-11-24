// Script para suprimir erros de rede do Supabase no console
(function() {
  'use strict';
  
  // Intercepta console.error para filtrar erros do Supabase
  const originalError = console.error;
  console.error = function(...args) {
    // Verifica se é um erro relacionado ao Supabase
    const errorString = args.join(' ');
    
    // Lista de padrões de erro do Supabase para suprimir
    const supabaseErrorPatterns = [
      'Failed to fetch',
      'supabase.co',
      'auth/v1/user',
      'Network Failed',
      'TypeError: Failed to fetch'
    ];
    
    // Se o erro contém algum padrão do Supabase, não exibe
    const isSupabaseError = supabaseErrorPatterns.some(pattern => 
      errorString.includes(pattern)
    );
    
    if (!isSupabaseError) {
      originalError.apply(console, args);
    }
  };
  
  // Intercepta eventos de erro não tratados
  window.addEventListener('error', function(event) {
    const errorString = event.message || '';
    
    // Suprime erros de rede do Supabase
    if (errorString.includes('Failed to fetch') || 
        errorString.includes('supabase.co')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Intercepta promessas rejeitadas não tratadas
  window.addEventListener('unhandledrejection', function(event) {
    const errorString = String(event.reason);
    
    // Suprime erros de rede do Supabase
    if (errorString.includes('Failed to fetch') || 
        errorString.includes('supabase.co')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
})();
