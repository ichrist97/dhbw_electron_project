-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 19. Feb 2019 um 15:11
-- Server-Version: 10.1.37-MariaDB
-- PHP-Version: 7.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `nebenkosten`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `zählerstand`
--

CREATE TABLE `zählerstand` (
  `id` int(11) NOT NULL,
  `zählernummer` int(11) NOT NULL,
  `datum` date NOT NULL,
  `verbrauch` int(11) NOT NULL,
  `zählertyp_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `zählerstand`
--

INSERT INTO `zählerstand` (`id`, `zählernummer`, `datum`, `verbrauch`, `zählertyp_id`) VALUES
(1, 123, '2019-01-01', 1, 1),
(2, 123, '2019-01-02', 2, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `zählertyp`
--

CREATE TABLE `zählertyp` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `zählertyp`
--

INSERT INTO `zählertyp` (`id`, `name`) VALUES
(1, 'Wasser'),
(2, 'Strom'),
(3, 'Gas');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `zählerstand`
--
ALTER TABLE `zählerstand`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_zählertyp` (`zählertyp_id`);

--
-- Indizes für die Tabelle `zählertyp`
--
ALTER TABLE `zählertyp`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `zählertyp`
--
ALTER TABLE `zählertyp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `zählerstand`
--
ALTER TABLE `zählerstand`
  ADD CONSTRAINT `fk_zählertyp` FOREIGN KEY (`zählertyp_id`) REFERENCES `zählertyp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
