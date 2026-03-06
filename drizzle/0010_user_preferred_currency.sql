ALTER TABLE `users`
ADD COLUMN `preferredCurrency` enum('BRL','USD','ARS','CLP','COP','MXN','PEN','UYU') NOT NULL DEFAULT 'BRL';
