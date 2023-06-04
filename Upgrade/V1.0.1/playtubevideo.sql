ALTER TABLE `comments` ADD `approved` TINYINT(1) NOT NULL DEFAULT '1' AFTER `owner_id`, ADD `replies_approved` INT(11) NOT NULL DEFAULT '0' AFTER `approved`;
ALTER TABLE `users` ADD `monetization_request` TINYINT(1) NOT NULL DEFAULT '0' AFTER `monetization`;

INSERT INTO `settings` (`name`, `value`) VALUES ('enable_comment_approve', '0'), ('autoapproveverified_user_comment', '1') ,('signup_form_lastname', '1') , ('signup_form_username', '1') ,
('signup_form_gender', '1') ,('signup_form_image', '1') , ('image_upload_limit' ,'10'), ('advertisement_upload_limit' ,'20'),('video_upload_videos_type','360,720');

ALTER TABLE `videos` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';
ALTER TABLE `blogs` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';
ALTER TABLE `channels` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';
ALTER TABLE `playlists` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';
ALTER TABLE `userdetails` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';
ALTER TABLE `artists` ADD `autoapprove_comments` TINYINT(1) NOT NULL DEFAULT '1';

UPDATE `emailtemplates` SET `vars` = '{\"getstarted\":\"\",\"contactus\":\"\",\"email\":\"\"}' WHERE `emailtemplates`.`type` = 'welcome';
UPDATE `emailtemplates` SET `vars` = '{\"usertitle\":\"\",\"signupdate\":\"\",\"userprofilelink\":\"\"}' WHERE `emailtemplates`.`type` = 'notify_admin_user_signup';
UPDATE `emailtemplates` SET `vars` = '{\"usertitle\":\"\",\"senderemail\":\"\",\"message\":\"\"}' WHERE `emailtemplates`.`type` = 'contact';

ALTER TABLE `pages` ADD `custom_tags` TEXT NULL AFTER `custom`;

ALTER TABLE `artists` ADD `age` VARCHAR(255) NULL AFTER `autoapprove_comments`, ADD `gender` VARCHAR(255) NULL AFTER `age`, ADD `birthplace` VARCHAR(255) NULL AFTER `gender`;

DROP TABLE IF EXISTS `artist_photos`;
CREATE TABLE `artist_photos` (
  `photo_id` int(11) UNSIGNED NOT NULL auto_increment,
   `artist_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `title` varchar(255) NULL,
  `description` text NULL,
  PRIMARY KEY (`photo_id`),
  KEY `artist_id` (`artist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;