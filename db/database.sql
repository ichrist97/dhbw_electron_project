-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 21. Feb 2019 um 17:53
-- Server-Version: 10.1.37-MariaDB
-- PHP-Version: 7.2.12

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
  `verbrauch` float NOT NULL,
  `zählertyp_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `zählerstand`
--

INSERT INTO `zählerstand` (`id`, `zählernummer`, `datum`, `verbrauch`, `zählertyp_id`) VALUES
(1, 91862, '2017-11-21', 956.222, 3),
(2, 91862, '2017-11-23', 962, 3),
(3, 91862, '2017-11-23', 967, 3),
(4, 91862, '2017-11-25', 978, 3),
(5, 91862, '2017-11-26', 982, 3),
(6, 91862, '2018-01-07', 1227.7, 3),
(7, 91862, '2018-01-24', 1383, 3),
(8, 91862, '2018-02-08', 1541, 3),
(9, 91862, '2018-02-09', 1550, 3),
(10, 91862, '2018-02-17', 1578, 3),
(11, 91862, '2018-02-24', 1661, 3),
(12, 91862, '2018-03-01', 1699, 3),
(13, 91862, '2018-03-12', 1800, 3),
(14, 91862, '2018-03-17', 1841.8, 3),
(15, 91862, '2018-03-23', 1904, 3),
(16, 91862, '2018-03-31', 1926.9, 3),
(17, 91862, '2018-04-08', 1965.2, 3),
(18, 91862, '2018-04-13', 1980.09, 3),
(19, 91862, '2018-04-20', 1995.7, 3),
(20, 91862, '2018-10-01', 2049.35, 3),
(21, 91862, '2018-10-08', 2077.5, 3),
(22, 91862, '2018-10-23', 2079.78, 3),
(23, 91862, '2018-10-27', 2100, 3),
(24, 91862, '2018-10-05', 2106.3, 3),
(25, 91862, '2018-11-22', 2185, 3),
(26, 91862, '2018-12-02', 2241, 3),
(27, 91862, '2019-01-05', 2556, 3),
(28, 91862, '2019-01-14', 2680, 3),
(29, 91862, '2019-01-21', 2765, 3),
(30, 91862, '2019-02-10', 3049.49, 3),
(31, 91862, '2019-02-12', 3071.52, 3);

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
-- AUTO_INCREMENT für Tabelle `zählerstand`
--
ALTER TABLE `zählerstand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

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
