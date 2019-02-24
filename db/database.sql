-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 24. Feb 2019 um 17:37
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
-- Tabellenstruktur für Tabelle `zaehlerstand`
--

CREATE TABLE `zaehlerstand` (
  `id` int(11) NOT NULL,
  `zaehlernummer` int(11) NOT NULL,
  `datum` date NOT NULL,
  `verbrauch` float NOT NULL,
  `preisProEinheit` float DEFAULT NULL,
  `zaehlertyp_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `zaehlerstand`
--

INSERT INTO `zaehlerstand` (`id`, `zaehlernummer`, `datum`, `verbrauch`, `preisProEinheit`, `zaehlertyp_id`) VALUES
(1, 91862, '2017-11-21', 956.222, 5.27, 3),
(2, 91862, '2017-11-23', 962, 5.27, 3),
(3, 91862, '2017-11-23', 967, 5.27, 3),
(4, 91862, '2017-11-25', 978, 5.27, 3),
(5, 91862, '2017-11-26', 982, 5.27, 3),
(6, 91862, '2018-01-07', 1227.7, 5.5, 3),
(7, 91862, '2018-01-24', 1383, 5.5, 3),
(8, 91862, '2018-02-08', 1541, 5.5, 3),
(9, 91862, '2018-02-09', 1550, 5.5, 3),
(10, 91862, '2018-02-17', 1578, 5.5, 3),
(11, 91862, '2018-02-24', 1661, 5.5, 3),
(12, 91862, '2018-03-01', 1699, 5.5, 3),
(13, 91862, '2018-03-12', 1800, 5.5, 3),
(14, 91862, '2018-03-17', 1841.8, 5.5, 3),
(15, 91862, '2018-03-23', 1904, 5.5, 3),
(16, 91862, '2018-03-31', 1926.9, 5.5, 3),
(17, 91862, '2018-04-08', 1965.2, 5.5, 3),
(18, 91862, '2018-04-13', 1980.09, 5.5, 3),
(19, 91862, '2018-04-20', 1995.7, 5.5, 3),
(20, 91862, '2018-10-01', 2049.35, 5.5, 3),
(21, 91862, '2018-10-08', 2077.5, 5.5, 3),
(22, 91862, '2018-10-23', 2079.78, 5.5, 3),
(23, 91862, '2018-10-27', 2100, 5.5, 3),
(24, 91862, '2018-10-05', 2106.3, 5.5, 3),
(25, 91862, '2018-11-22', 2185, 5.5, 3),
(26, 91862, '2018-12-02', 2241, 5.5, 3),
(27, 91862, '2019-01-05', 2556, 5.5, 3),
(28, 91862, '2019-01-14', 2680, 5.5, 3),
(29, 91862, '2019-01-21', 2765, 5.5, 3),
(30, 91862, '2019-02-10', 3049.49, 5.5, 3),
(31, 91862, '2019-02-12', 3071.52, 5.5, 3);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `zaehlertyp`
--

CREATE TABLE `zaehlertyp` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `zaehlertyp`
--

INSERT INTO `zaehlertyp` (`id`, `name`) VALUES
(1, 'Wasser'),
(2, 'Strom'),
(3, 'Gas');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `zaehlerstand`
--
ALTER TABLE `zaehlerstand`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_zählertyp` (`zaehlertyp_id`);

--
-- Indizes für die Tabelle `zaehlertyp`
--
ALTER TABLE `zaehlertyp`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `zaehlerstand`
--
ALTER TABLE `zaehlerstand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT für Tabelle `zaehlertyp`
--
ALTER TABLE `zaehlertyp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `zaehlerstand`
--
ALTER TABLE `zaehlerstand`
  ADD CONSTRAINT `fk_zählertyp` FOREIGN KEY (`zaehlertyp_id`) REFERENCES `zaehlertyp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
