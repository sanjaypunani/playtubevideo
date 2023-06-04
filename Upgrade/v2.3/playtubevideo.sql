DROP TABLE IF EXISTS `audio`;
CREATE TABLE `audio`(
  `audio_id` int(11) unsigned NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `custom_url` varchar(255) NOT NULL,
  `description` text NULL,
  `peaks` LONGTEXT NULL,
  `release_date` varchar(100) NOT NULL,
  `image` varchar(255) NULL,
  `audio_file` varchar(255) NOT NULL,
  `play_count` int(11)  unsigned NOT NULL default '0',
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `approve` tinyint NOT NULL default '1',
  `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1',
  `search` tinyint(1) NOT NULL default '1',
  `size` varchar(255) NULL,
  `duration` varchar(50) NULL,
  `view_privacy` VARCHAR(24) NOT NULL,
  `is_locked` tinyint(1) NOT NULL default '0',
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `creation_date` datetime NOT NULL,
  `modified_date` datetime NOT NULL,
  PRIMARY KEY (`audio_id`),
  KEY (`owner_id`),
  KEY (`approve`),
  KEY (`search`),
  KEY (`title`),
  KEY (`release_date`),
  KEY (`play_count`),
  KEY (`view_count`),
  KEY (`comment_count`),
  KEY (`dislike_count`),
  KEY (`favourite_count`),
  KEY (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_unicode_ci;

INSERT INTO `menus` ( `submenu_id`, `subsubmenu_id`, `label`, `params`, `customParam`, `target`, `url`, `enabled`, `order`, `icon`, `custom`, `type`,`content_type`) VALUES
( 0, 0, 'Audio', NULL, NULL, '_self', '/audio', 1, 4, 'fa fa-headphones', 0, 1,'audio');

DROP TABLE IF EXISTS `referers`;
CREATE TABLE `referers` (
  `referer_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned not null default '0',
  `sitename` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(150) not NULL default 'video',
  `ip` varchar(45) not null default '',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`referer_id`),
  KEY `type` (`type`,`owner_id`),
  KEY  `sitename` (`sitename`),
  KEY `typeUnique` (`type`,`owner_id`,`creation_date`),
  KEY `typeIPUnique` (`type`,`ip`,`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
( 'audio_admin_approved', 'Site Admin approved your {audio}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_comment', '{subject} commented on your {audio} {comment_title}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_reply_comment', '{subject} replied to your {comment} on your {audio} {reply_title}', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_comments_like', '{subject} likes your {comment} on your {audio} {comment_title}.', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_comments_dislike', '{subject} dislike your {comment} on your {audio} \"{comment_title}\".', 'audio', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'audio', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'audio', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio_favourite', '{subject} marked your {audio} to Favourite.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_like', '{subject} likes your {audio}.', 'audio', '{\"audio\":\"audio\"}'),
( 'audio_dislike', '{subject} dislike your {audio}.', 'audio', '{\"audio\":\"audio\"}');

INSERT IGNORE INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'audio', 'audio_admin_approved', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_comment', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_reply_comment', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_comments_like', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_comments_dislike', '{\"audio\":\"audio\",\"comment\":\"comment\"}'),
( 'audio', 'audio_reply_like', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio', 'audio_reply_dislike', '{\"comment\":\"comment\",\"reply\":\"reply\"}'),
( 'audio', 'audio_favourite', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_like', '{\"audio\":\"audio\"}'),
( 'audio', 'audio_dislike', '{\"audio\":\"audio\"}');

INSERT IGNORE INTO `pages` ( `type`, `label`, `title`, `url`, `description`, `keywords`, `image`, `content`, `view_count`, `custom`, `banner_image`, `banner`) VALUES
( 'audio_browse', 'Audio Browse Page', 'Audio', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'audio_view', 'Audio View Page', '', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'audio_edit_create', 'Audio Edit Page', 'Edit Audio', NULL, '', '', NULL, NULL, 0, 0, 1, NULL),
( 'audio_create', 'Audio Create Page', 'Create Audio', NULL, '', '', NULL, NULL, 0, 0, 1, NULL);

ALTER TABLE `userdetails` ADD `is_popular` TINYINT(1) NOT NULL DEFAULT '0';
ALTER TABLE `categories` ADD `show_home` TINYINT(1) NOT NULL DEFAULT '0';

UPDATE `categories` SET `show_home` = 1 where `show_video` = 1 AND `subcategory_id` = 0 AND `subsubcategory_id` = 0;
ALTER TABLE `users` ADD `whitelist_domain` TEXT NULL;
ALTER TABLE `users` ADD `ip_address` VARCHAR(45) NULL;

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'edit' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'delete' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'create' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');

INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'quota' as `name`,
    0 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');
  
  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'auto_approve' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('user','admin','moderator');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'delete' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

 INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'edit' as `name`,
    2 as `value`
  FROM `levels` WHERE `type` IN('moderator', 'admin');

  INSERT IGNORE INTO `level_permissions`
  SELECT
    level_id as `level_id`,
    'audio' as `type`,
    'view' as `name`,
    1 as `value`
  FROM `levels` WHERE `type` IN('public');


DROP TABLE IF EXISTS `tip_donors`;
CREATE TABLE `tip_donors` (
  `donor_id` int(11) UNSIGNED NOT NULL auto_increment,
  `owner_id` int(11) unsigned NOT null default '0',
  `video_id` int(11) unsigned NOT null default '0',
  `price` decimal(16,2) NOT null default '0.00',
  `ip` varchar(45) NOT null default '',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`donor_id`),
  KEY `owner_id` (`video_id`),
  KEY `creation_date` (`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `transactions` ADD `sender_id` INT(11) NOT NULL;
ALTER TABLE `transactions` ADD INDEX(`sender_id`);

INSERT INTO `settings` (`name`, `value`) VALUES
('enable_audio','1'),
('audio_favourite','1'),
('audio_like','1'),
('audio_dislike','1'),
('audio_comment','1'),
('audio_comment_like','1'),
('audio_comment_dislike','1');