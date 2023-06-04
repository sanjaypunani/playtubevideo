UPDATE `menus` SET `icon` = 'fas fa-video' WHERE `menus`.`url` = '/videos';
UPDATE `menus` SET `icon` = 'fas fa-user-friends' WHERE `menus`.`url` = '/members';
UPDATE `menus` SET `icon` = 'fas fa-rss' WHERE `menus`.`url` = '/blogs';
UPDATE `menus` SET `icon` = 'fas fa-file-video' WHERE `menus`.`url` = '/channels';
UPDATE `menus` SET `icon` = 'fa fa-play-circle' WHERE `menus`.`url` = '/playlists';
UPDATE `menus` SET `icon` = 'far fa-user' WHERE `menus`.`menu_id` = '9';
UPDATE `menus` SET `icon` = 'fa fa-list-alt' WHERE `menus`.`menu_id` = '6';


INSERT INTO `themes` (`key`, `value`, `type`) VALUES
( 'header_sidebar_bg', '#212121', 'dark'),
( 'header_sidebar_color', '#ffffff', 'dark'),
( 'header_sidebar_hovercolor', '#383838', 'dark'),
( 'header_sidebar_title_color', '#fdfdfd', 'dark'),
( 'header_sidebar_icon_color', '#8f908f', 'dark'),
( 'header_sidebar_fontsize', '16px', 'dark'),
( 'header_sidebar_search_bg', '#282828', 'dark'),
( 'header_sidebar_search_border', '#181818', 'dark'),
( 'header_sidebar_search_textcolor', '#fff', 'dark'),
( 'header_popup_inputborder', '#1b262c', 'dark'),
( 'header_popup_inputbg', '#1b262c', 'dark'),
( 'header_popup_inputtextcolor', '#fff', 'dark'),
( 'header_popup_headbg', '#12191d', 'dark'),
( 'header_popup_bodybg', '#111', 'dark'),
( 'header_sidebar_bg', '#fff', 'white'),
( 'header_sidebar_color', '#000000', 'white'),
( 'header_sidebar_hovercolor', '#e5e5e5', 'white'),
( 'header_sidebar_title_color', '#000', 'white'),
( 'header_sidebar_icon_color', '#8f908f', 'white'),
( 'header_sidebar_fontsize', '16px', 'white'),
( 'header_sidebar_search_bg', '#e4e6ea', 'white'),
( 'header_sidebar_search_border', '#f5f5f5', 'white'),
( 'header_sidebar_search_textcolor', '#000', 'white'),
( 'header_popup_inputborder', '#f5f5f5', 'white'),
( 'header_popup_inputbg', '#e4e6ea', 'white'),
( 'header_popup_inputtextcolor', '#000', 'white'),
( 'header_popup_headbg', '#f5f5f5', 'white'),
( 'header_popup_bodybg', '#fff', 'white');