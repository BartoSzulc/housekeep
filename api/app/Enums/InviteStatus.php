<?php

namespace App\Enums;

enum InviteStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case EXPIRED = 'expired';
    case REVOKED = 'revoked';
}
