<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
  /**
   * Register any authentication / authorization services.
   */
  public function boot(): void
  {
    Auth::provider('array', function ($app, array $config) {
      // Registra nosso provider personalizado para o JWT
      return new JwtUserProvider();
    });
  }
}
