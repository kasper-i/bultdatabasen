-- MySQL Script generated by MySQL Workbench
-- sön 10 okt 2021 11:35:54
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bultdatabasen
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `resource_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `resource_type` (
  `name` VARCHAR(64) NOT NULL,
  `depth` INT NOT NULL,
  PRIMARY KEY (`name`),
  INDEX `index2` (`name` ASC, `depth` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(256) NULL,
  `first_name` VARCHAR(256) NULL,
  `last_name` VARCHAR(256) NULL,
  `first_seen` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `resource`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `resource` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NULL,
  `type` VARCHAR(64) NOT NULL,
  `depth` INT NOT NULL,
  `parent_id` VARCHAR(36) NULL,
  `btime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `buser_id` VARCHAR(36) NOT NULL,
  `muser_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_resource_1_idx` (`parent_id` ASC) VISIBLE,
  INDEX `fk_resource_2_idx` (`type` ASC, `depth` ASC) VISIBLE,
  INDEX `index4` (`id` ASC, `name` ASC) VISIBLE,
  INDEX `fk_resource_3_idx` (`buser_id` ASC) VISIBLE,
  INDEX `fk_resource_4_idx` (`muser_id` ASC) VISIBLE,
  CONSTRAINT `fk_resource_1`
    FOREIGN KEY (`parent_id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resource_2`
    FOREIGN KEY (`type` , `depth`)
    REFERENCES `resource_type` (`name` , `depth`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_resource_3`
    FOREIGN KEY (`buser_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resource_4`
    FOREIGN KEY (`muser_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `route_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `route_type` (
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `route`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `route` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `alt_name` VARCHAR(256) NULL,
  `year` INT NULL,
  `route_type` VARCHAR(64) NULL,
  `external_link` VARCHAR(2048) NULL,
  `length` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_route_2_idx` (`route_type` ASC) VISIBLE,
  INDEX `fk_route_1_idx` (`id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_route_1`
    FOREIGN KEY (`id` , `name`)
    REFERENCES `resource` (`id` , `name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_route_2`
    FOREIGN KEY (`route_type`)
    REFERENCES `route_type` (`name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `point`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `point` (
  `id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_point_2`
    FOREIGN KEY (`id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `connection`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `connection` (
  `route_id` VARCHAR(36) NOT NULL,
  `src_point_id` VARCHAR(36) NOT NULL,
  `dst_point_id` VARCHAR(36) NOT NULL,
  INDEX `fk_connection_1_idx` (`src_point_id` ASC) VISIBLE,
  INDEX `fk_connection_2_idx` (`dst_point_id` ASC) VISIBLE,
  PRIMARY KEY (`src_point_id`, `dst_point_id`, `route_id`),
  INDEX `fk_connection_3_idx` (`route_id` ASC) VISIBLE,
  UNIQUE INDEX `index5` (`route_id` ASC, `dst_point_id` ASC) VISIBLE,
  UNIQUE INDEX `index6` (`route_id` ASC, `src_point_id` ASC) VISIBLE,
  CONSTRAINT `fk_connection_1`
    FOREIGN KEY (`src_point_id`)
    REFERENCES `point` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_connection_2`
    FOREIGN KEY (`dst_point_id`)
    REFERENCES `point` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_connection_3`
    FOREIGN KEY (`route_id`)
    REFERENCES `route` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `image` (
  `id` VARCHAR(36) NOT NULL,
  `mime_type` VARCHAR(64) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `description` TEXT NULL,
  `rotation` INT NULL,
  `size` INT NOT NULL,
  `width` INT NOT NULL,
  `height` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_point_image_1`
    FOREIGN KEY (`id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `user_team`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_team` (
  `user_id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `admin` TINYINT NOT NULL,
  PRIMARY KEY (`user_id`, `team_id`),
  INDEX `fk_user_team_2_idx` (`team_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_team_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_team_2`
    FOREIGN KEY (`team_id`)
    REFERENCES `team` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `manufacturer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `manufacturer` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `component_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `component_type` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `component`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `component` (
  `id` VARCHAR(36) NOT NULL,
  `component_type_id` VARCHAR(36) NULL,
  `manufacturer_id` VARCHAR(36) NULL,
  `model` VARCHAR(256) NULL,
  `year_manufactured` TINYINT NULL,
  `batch_number` VARCHAR(256) NULL,
  `inherited_component_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_component_2_idx` (`manufacturer_id` ASC) VISIBLE,
  INDEX `fk_component_3_idx` (`inherited_component_id` ASC) VISIBLE,
  INDEX `fk_component_1_idx` (`component_type_id` ASC) VISIBLE,
  CONSTRAINT `fk_component_2`
    FOREIGN KEY (`manufacturer_id`)
    REFERENCES `manufacturer` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_3`
    FOREIGN KEY (`inherited_component_id`)
    REFERENCES `component` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_component_1`
    FOREIGN KEY (`component_type_id`)
    REFERENCES `component_type` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `part`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `part` (
  `id` VARCHAR(36) NOT NULL,
  `component_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_part_2_idx` (`component_id` ASC) VISIBLE,
  CONSTRAINT `fk_part_2`
    FOREIGN KEY (`component_id`)
    REFERENCES `component` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`name`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `user_role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_role` (
  `user_id` VARCHAR(36) NOT NULL,
  `resource_id` VARCHAR(36) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`user_id`, `resource_id`),
  INDEX `fk_user_role_2_idx` (`resource_id` ASC) VISIBLE,
  INDEX `fk_user_role_3_idx` (`role` ASC) VISIBLE,
  CONSTRAINT `fk_user_role_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_role_2`
    FOREIGN KEY (`resource_id`)
    REFERENCES `resource` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_role_3`
    FOREIGN KEY (`role`)
    REFERENCES `role` (`name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `team_role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_role` (
  `team_id` VARCHAR(36) NOT NULL,
  `resource_id` VARCHAR(36) NOT NULL,
  `role` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`team_id`, `resource_id`),
  INDEX `fk_team_role_2_idx` (`resource_id` ASC) VISIBLE,
  INDEX `fk_team_role_3_idx` (`role` ASC) VISIBLE,
  CONSTRAINT `fk_team_role_1`
    FOREIGN KEY (`team_id`)
    REFERENCES `team` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_team_role_2`
    FOREIGN KEY (`resource_id`)
    REFERENCES `resource` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_team_role_3`
    FOREIGN KEY (`role`)
    REFERENCES `role` (`name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `invite`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `invite` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `expiration_date` DATETIME NOT NULL,
  `status` ENUM('pending', 'accepted', 'declined', 'revoked') NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_invite_1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_invite_2_idx` (`team_id` ASC) VISIBLE,
  CONSTRAINT `fk_invite_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_invite_2`
    FOREIGN KEY (`team_id`)
    REFERENCES `team` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `area`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `area` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_area_1_idx` (`id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_area_1`
    FOREIGN KEY (`id` , `name`)
    REFERENCES `resource` (`id` , `name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `crag`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crag` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_crag_1_idx` (`id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_crag_1`
    FOREIGN KEY (`id` , `name`)
    REFERENCES `resource` (`id` , `name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `sector`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sector` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_sector_1_idx` (`id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_sector_1`
    FOREIGN KEY (`id` , `name`)
    REFERENCES `resource` (`id` , `name`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `foster_care`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `foster_care` (
  `id` VARCHAR(36) NOT NULL,
  `foster_parent_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`, `foster_parent_id`),
  INDEX `fk_foster_care_2_idx` (`foster_parent_id` ASC) VISIBLE,
  CONSTRAINT `fk_foster_care_1`
    FOREIGN KEY (`id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_foster_care_2`
    FOREIGN KEY (`foster_parent_id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bolt`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bolt` (
  `id` VARCHAR(36) NOT NULL,
  `type` ENUM('expansion', 'glue') NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bolt_1`
    FOREIGN KEY (`id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `task`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `task` (
  `id` VARCHAR(36) NOT NULL,
  `status` ENUM('open', 'assigned', 'closed', 'rejected') NOT NULL DEFAULT 'open',
  `description` TEXT NOT NULL,
  `assignee` VARCHAR(36) NULL,
  `comment` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_task_2_idx` (`assignee` ASC) VISIBLE,
  CONSTRAINT `fk_task_1`
    FOREIGN KEY (`id`)
    REFERENCES `resource` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_task_2`
    FOREIGN KEY (`assignee`)
    REFERENCES `user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
