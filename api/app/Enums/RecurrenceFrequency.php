<?php

namespace App\Enums;

enum RecurrenceFrequency: string
{
    case DAILY = 'DAILY';
    case WEEKLY = 'WEEKLY';
    case MONTHLY = 'MONTHLY';
    case YEARLY = 'YEARLY';
}
