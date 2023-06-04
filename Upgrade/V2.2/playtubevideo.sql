ALTER TABLE `videos` ADD `mediaserver_stream_id` varchar(255) NULL;
ALTER TABLE `users` ADD `streamkey` varchar(255) NULL;
ALTER TABLE `livestreaming_chats` ADD `params` VARCHAR(255) NOT NULL DEFAULT '{}';
ALTER TABLE `channels` ADD `channel_subscription_amount` VARCHAR(255) NULL;
ALTER TABLE `livestreaming_chats` ADD `id` VARCHAR(255) NULL;
ALTER TABLE `livestreaming_chats` ADD INDEX(`id`);

INSERT INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'default', 'channel_support_payment_subscription_active', NULL),
( 'default', 'channel_support_payment_subscription_pending', NULL),
( 'default', 'channel_support_payment_subscription_overdue', NULL),
( 'default', 'channel_support_payment_subscription_refunded', NULL),
( 'default', 'channel_support_payment_subscription_expired', NULL),
( 'default', 'channel_support_payment_subscription_recurrence', NULL),
( 'default', 'channel_support_payment_subscription_cancelled', NULL),
( 'default', 'channel_support_payment_subscription_disputeclear', NULL),
( 'default', 'channel_support_payment_subscription_disputecreate', NULL),
( 'default', 'member_invite', NULL);

ALTER TABLE `videos` ADD INDEX(`mediaserver_stream_id`);
ALTER TABLE `users` ADD INDEX(`streamkey`);

INSERT IGNORE INTO `banwords` (`text`, `type`) VALUES
( 'support', 'default');

CREATE TABLE `invites` (
  `id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `recipient` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `creation_date` datetime NOT NULL,
  `new_user_id` int(11) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `tips` (
  `tip_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  `currency` varchar(255) NOT NULL default 'USD',
  `purchase_count` int(11) NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`tip_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_id`,`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `defaultstreaming`;
CREATE TABLE `defaultstreaming` (
  `defaultstreaming_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL default 'Live Streaming',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `description` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `category_id` int(11) unsigned NOT NULL default '0',
  `subcategory_id` int(11) unsigned NOT NULL default '0',
  `subsubcategory_id` int(11) unsigned NOT NULL default '0',
  `view_privacy` VARCHAR(24) NOT NULL,
  `adult` tinyint NOT NULL default '1',
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `enable_chat` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`defaultstreaming_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_type`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `defaulttips`;
CREATE TABLE `defaulttips` (
  `defaulttip_id` int(10) UNSIGNED NOT NULL auto_increment ,
  `user_id` int(11) UNSIGNED NOT NULL,
  `resource_type` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL default '0',
  PRIMARY KEY (`defaulttip_id`),
  KEY `user_id` (`user_id`),
  KEY `resource_id_type` (`resource_type`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `settings` (`name`, `value`) VALUES
('video_tip','1'),
('video_embed_code','1');
