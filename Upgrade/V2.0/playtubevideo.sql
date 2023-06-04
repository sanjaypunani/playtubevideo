ALTER TABLE `videos` ADD `is_livestreaming` TINYINT(1) NOT NULL DEFAULT '0';
ALTER TABLE `videos` ADD `agora_resource_id` TEXT NULL;
ALTER TABLE `videos` ADD `agora_sid` TEXT NULL;
ALTER TABLE `videos` ADD `channel_name` VARCHAR(255) NULL;
ALTER TABLE `videos` ADD `total_viewer` int(11) unsigned NOT NULL DEFAULT '0';
ALTER TABLE `videos` ADD `enable_chat` TINYINT(1) NOT NULL DEFAULT '0';

ALTER TABLE `videos` ADD INDEX `is_livestreaming` (`is_livestreaming`);

DROP TABLE IF EXISTS `livestreaming_chats`;
CREATE TABLE `livestreaming_chats` (
  `chat_id` int(11) UNSIGNED NOT NULL auto_increment,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` int(11) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `creation_date` datetime NOT NULL, 
  PRIMARY KEY (`chat_id`),
  KEY `owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


INSERT INTO `pages` ( `type`, `label`, `title`, `url`, `description`, `keywords`, `image`, `content`, `view_count`, `custom`, `banner_image`, `banner`) VALUES
( 'live_streaming_create', 'Go Live Page', 'Go Live', '', '', NULL, '', '0', 0, 0, 0, NULL),
( 'treading_video_browse', 'Trending Videos Browse Page', 'Trending Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'top_video_browse', 'Top Videos Browse Page', 'Top Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'latest_video_browse', 'Latest Videos Browse Page', 'Latest Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL),
( 'live_video_browse', 'Live Videos Browse Page', 'Live Videos', NULL, '', '', NULL, NULL, 0, 0, 0, NULL);


INSERT IGNORE INTO `banwords` (`text`, `type`) VALUES
( 'live-streaming','default'),
( 'live', 'default');

INSERT INTO `menus` ( `submenu_id`, `subsubmenu_id`, `label`, `params`, `customParam`, `target`, `url`, `enabled`, `order`, `icon`, `custom`, `type`,`content_type`) VALUES
( 0, 0, 'Live', NULL, 'live-streaming=1', '_self', '/live', 0, 7, 'fa fa-play', 0, 1,'live-streaming');


INSERT INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
( 'live_video', '{subject} started a live {videos}.', 'livestreaming', '{\"videos\":\"video\"}');

INSERT INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'livestreaming', 'live_video', '{\"videos\":\"video\"}');