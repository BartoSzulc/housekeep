<?php

use App\Jobs\SendExpiryAlerts;
use App\Jobs\SendLowStockAlerts;
use App\Jobs\SendTaskReminders;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new SendExpiryAlerts)->dailyAt('08:00');
Schedule::job(new SendLowStockAlerts)->dailyAt('08:00');
Schedule::job(new SendTaskReminders)->everyFifteenMinutes();
