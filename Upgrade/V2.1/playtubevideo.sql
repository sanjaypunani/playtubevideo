DROP TABLE IF EXISTS `user_apple`;
CREATE TABLE `user_apple` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `apple_uid` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `apple_uid` (`apple_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `channel_posts`;
CREATE TABLE `channel_posts` (
  `post_id` int(11) UNSIGNED NOT NULL auto_increment,
  `channel_id` int(11) UNSIGNED NOT NULL,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `title` text COLLATE utf8_unicode_ci NULL,
  `image` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_general_ci NULL,
  `view_count` int(11) unsigned NOT NULL default '0',
  `comment_count` int(11) unsigned NOT NULL default '0',
  `like_count` int(11) unsigned NOT NULL default '0',
  `dislike_count` int(11) unsigned NOT NULL default '0',  
  `favourite_count` int(11) unsigned NOT NULL default '0',
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `channel_id` (`channel_id`),
  KEY `creation_date`(`creation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `notificationtypes` ( `type`, `body`, `content_type`, `vars`) VALUES
( 'channel_posts_like', '{subject} likes your {channel_posts}.', 'channels', '{\"channel_posts\":\"post\"}'),
( 'channel_posts_dislike', '{subject} dislike your {channel_posts}.', 'channels', '{\"channel_posts\":\"post\"}'),
( 'channel_posts_comments_like', '{subject} likes your {comment} on your {channel_posts} {comment_title}.', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_comments_dislike', '{subject} dislike your {comment} on your {channel_posts} \"{comment_title}\".', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_like', '{subject} likes your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_dislike', '{subject} dislike your {reply} on {comment} {reply_title}.', 'channels', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channel_posts_reply_comment', '{subject} replied to your {comment} on your {channel_posts} {reply_title}', 'channels', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channel_posts_comment', '{subject} commented on your {channel_posts} {comment_title}.', 'channels', '{\"channel_posts\":\"post\"}');

INSERT INTO `emailtemplates` ( `content_type`, `type`, `vars`) VALUES
( 'channels', 'channel_posts_like', '{\"channel_posts\":\"post\"}'),
( 'channels', 'channel_posts_dislike', '{\"channel_posts\":\"post\"}'),
( 'channels', 'channel_posts_comments_like', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_comments_dislike', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_reply_like', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_reply_dislike', '{\"reply\":\"reply\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_reply_comment', '{\"channel_posts\":\"post\",\"comment\":\"comment\"}'),
( 'channels', 'channel_posts_comment', '{\"channel_posts\":\"post\"}');

INSERT IGNORE INTO `banwords` (`text`, `type`) VALUES
( 'post', 'default');

ALTER TABLE `users` ADD `timezone` varchar(255) NOT NULL DEFAULT 'America/Los_Angeles';

INSERT INTO `settings` (`name`, `value`) VALUES
('member_default_timezone','America/Los_Angeles');