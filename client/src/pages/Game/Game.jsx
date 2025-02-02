import React, { useState, useEffect } from "react";
import userAPI from "../../utils/userAPI";

import Boss from "../../components/GameComponents/Boss";
import Card from "../../components/Card";
import AttackBtn from "../../components/GameComponents/AttackBtn";
import AttackSpecialBtn from "../../components/GameComponents/AttackSpecialBtn";
import DefenseSpecialBtn from "../../components/GameComponents/DefenseSpecialBtn";
import TricksterSpecialBtn from "../../components/GameComponents/TricksterSpecialBtn";
import AlertModal from "../../components/AlertModals/AlertModal";

import ProgressBar from "react-bootstrap/ProgressBar";

import mushroomHallBG from "../../images/mushroomHallBG.png";
import mushroomMin from "../../images/mushroomMin.png";
import dungeonBG from "../../images/dungeonBG.png";
import dungeonMin from "../../images/dungeonMin.png";
import caveBG from "../../images/caveBG.png";
import caveMin from "../../images/caveMin.png";
import "./Game.css";

const bosses = [
  {
    name: "STANMANGA: SOURCE OF TRUTH",
    image: "https://ik.imagekit.io/en4cpe64r/stanmanga.png?updatedAt=1710778082029",
    health: 500,
    attack: 15,
    background: dungeonBG,
    bgMin: dungeonMin,
    bossIntro: "A WICKED PROFESSOR APPROACHES!",
  },
  {
    name: "GOGOL: DATA DEVOURER",
    image: "https://ik.imagekit.io/en4cpe64r/gogol.png?updatedAt=1710778082457",
    health: 625,
    attack: 25,
    background: caveBG,
    bgMin: caveMin,
    bossIntro: "GOGOL'S REACH KNOWS NO BOUNDS!",
  },
  {
    name: "GLITCHBLIGHT: THE UNDEFINED",
    image: "https://ik.imagekit.io/en4cpe64r/glitchblight.png?updatedAt=1710778082088",
    health: 750,
    attack: 35,
    background: mushroomHallBG,
    bgMin: mushroomMin,
    bossIntro: "DON'T LOOK DIRECTLY AT IT!!!",
  },
];

export default function Game() {
  const [bossAnimation, setBossAnimation] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(bosses[0]);
  const [currentBossAttack, setCurrentBossAttack] = useState(
    currentBoss.attack
  );
  let [bossHealth, setBossHealth] = useState(currentBoss.health);
  const [playerAttacked, setPlayerAttacked] = useState(false);
  const [userCards, setUserCards] = useState([]);
  const [userHealth, setUserHealth] = useState(100);
  const [maxUserHP, setMaxUserHP] = useState(userHealth);
  const [combatMessage, setCombatMessage] = useState(currentBoss.bossIntro);
  const [attackButtonDisabled, setAttackButtonDisabled] = useState(false);
  const [attackSpecialDisabled, setAttackSpecialDisabled] = useState(false);
  const [defenseSpecialDisabled, setDefenseSpecialDisabled] = useState(false);
  const [attackTricksterDisabled, setTricksterSpecialDisabled] =
    useState(false);
  const [bossIsSleepy, setBossIsSleepy] = useState(false);
  const [showRetreatModal, setShowRetreatModal] = useState(false);

  // Deal specified damage to boss
  const handleAttack = (creature, damage) => {
    setBossAnimation("animate__headShake");
    let newBossHealth = (bossHealth -= damage);
    // stops the progress bar from going into the negatives
    setBossHealth(newBossHealth >= 0 ? newBossHealth : 0);
    // lets us keep track of when the player has attacked
    setPlayerAttacked(true);
    // Display attack message
    let creatureName = creature.name;
    setCombatMessage(`${creatureName.toUpperCase()} ATTACKED!`);
    // Disable attack button until boss retaliates
    setAttackButtonDisabled(true);
  };

  // Special attack effects are applied conditionally based on creature type
  const handleSpecialAttack = (creature) => {
    let creatureType = creature.type;
    let creatureName = creature.name.toUpperCase();
    // Attackers deal a flat 150 damage upon critical hit
    if (creatureType === "attacker") {
      setAttackSpecialDisabled(true);
      let newBossHealth = (bossHealth -= 150);
      setBossHealth(newBossHealth >= 0 ? newBossHealth : 0);
      setPlayerAttacked(true);
      setCombatMessage(`${creatureName} USED CRITICAL HIT!`);
    }
    // Defenders heal the party for a flat 100 points
    if (creatureType === "defender") {
      setDefenseSpecialDisabled(true);
      setUserHealth((userHealth) => {
        let newUserHealth = userHealth + 100;
        newUserHealth = Math.min(newUserHealth, maxUserHP);
        return newUserHealth;
      });
      setDefenseSpecialDisabled(true);
      setPlayerAttacked(true);
      setCombatMessage(`${creatureName} USED HEAL!`);
    }
    // Tricksters set boss isSleepy state to true, bypassing boss retaliation in turn loop
    if (creatureType === "trickster") {
      setTricksterSpecialDisabled(true);
      setBossIsSleepy(true);
      setPlayerAttacked(true);
      setCombatMessage(`${creatureName} USED SLEEP!`);
    }
  };

  // Take player back to lobby upon defeat
  const handleRetreat = () => {
    window.location.href = "../";
  };

  // On page load...
  useEffect(() => {
    userAPI.getOneUser(localStorage.getItem("currentUser")).then((res) => {
      setUserCards(res.data[0].team);
    });
  }, []);

  // Set player health
  useEffect(() => {
    const healthArray = userCards.map((card) => card.health);
    // The player's health bar is the combined total of their team's health stat
    let totalHealth = 0;
    healthArray.forEach((healthValue) => {
      totalHealth += healthValue;
    });
    setMaxUserHP(totalHealth);
    setUserHealth(totalHealth);
  }, [userCards]);

  // Progress to next boss upon boss defeat
  useEffect(() => {
    // have to set a timeout otherwise the player will be attacked when the new boss is loaded
    setTimeout(() => {
      // Upon boss defeat, find the index of the current boss and iterate to the next boss in the array.
      if (bossHealth <= 0) {
        let currentIndex = bosses.indexOf(currentBoss);
        if (currentIndex < bosses.length - 1) {
          const nextBoss = bosses[currentIndex + 1];
          const newBossHealth = nextBoss.health;
          // Set all necessary values for next battle.
          setCurrentBoss(nextBoss);
          setCurrentBossAttack(nextBoss.attack);
          setAttackSpecialDisabled(false);
          setDefenseSpecialDisabled(false);
          setTricksterSpecialDisabled(false);
          setBossHealth(newBossHealth);
          setCombatMessage(nextBoss.bossIntro);
        } else {
          // When there are no bosses remaining, generate victory token and redirect to rewards screen
          setBossAnimation("animate__hinge");
          localStorage.setItem("playerVictory", true);
          setTimeout(() => {
            window.location.href = "/#/rewards";
          }, 3000);
        }
      }
    }, 1500);
  }, [bossHealth, currentBoss]);

  // Boss attacks back
  useEffect(() => {
    if (playerAttacked && bossIsSleepy === false) {
      setTimeout(() => {
        if (bossHealth > 0) {
          setBossAnimation("animate__bounceIn");
          setCombatMessage(`${currentBoss.name} RETALIATED!!!`);
          setUserHealth((userHealth) => {
            // generate a random attack value based on the boss's attack
            const randomMultiplier = Math.random() * 0.5 + 1;
            let randomAttack = currentBossAttack * randomMultiplier;
            let newUserHealth = userHealth - randomAttack;
            // Round to the nearest even number
            newUserHealth = Math.round(newUserHealth / 2) * 2;
            // Ensure newUserHealth is not negative
            newUserHealth = Math.max(0, newUserHealth);
            // If boss attack will kill player, show modal
            if (userHealth <= randomAttack) {
              setShowRetreatModal(true);
            }
            return newUserHealth;
          });
        }
        // reset player status to complete turn loop
        setAttackButtonDisabled(false);
        setPlayerAttacked(false);
      }, 1000);
    }
    if (playerAttacked && bossIsSleepy === true) {
      setCombatMessage(`${currentBoss.name} is sleeping! Shhhh...`);
      setPlayerAttacked(false);
      setTimeout(() => {
        // attack button enabled when boss wakes up to prevent soft-lock
        setAttackButtonDisabled(false);
      }, 5000);
    }
    // Set wake up message 5 seconds after boss wakes up.
    if (bossIsSleepy === true) {
      setTimeout(() => {
        // Boss wakes up
        setBossIsSleepy(false);
        setCombatMessage("GET READY!");
      }, 5000);
    }
  }),
    [playerAttacked, userHealth];

  return (
    <>
      <div
        className="game-bg col-12 bg-dark"
        style={{
          backgroundImage: `url(${currentBoss.background}), url(${currentBoss.bgMin})`,
        }}
      >
        <Boss
          animation={bossAnimation}
          bossName={currentBoss.name}
          bossImage={currentBoss.image}
          maxHP={currentBoss.health}
          bossHealth={bossHealth}
        />
        <p className="text-light text-center middle-text">
          {combatMessage}
        </p>
        <div className="progress-bar-container">
        <div className="team-bar">
        <ProgressBar
          className="my-3 col-12 progress team-progress-bar"
          now={userHealth}
          max={maxUserHP}
          label={`${userHealth} HP`}
          variant="primary"
          animated
        />
        </div>
        </div>
        <div className="team-container">
        <div className="d-flex justify-content-center pb-2">
          {userCards.map((creature, index) => (
            <div
              key={index}
              className={`animate__animated animate__fadeInLeftBig animate__delay-${index}s`}
            >
              <Card key={`creature_${creature._id}`} creature={creature} />

              <AttackBtn
                target={currentBoss}
                index={index}
                attackDamage={creature.attack}
                onClick={() => handleAttack(creature, creature.attack)}
                disabled={attackButtonDisabled}
                key={`attackBtn_${creature.id}`}
              />
              {creature.type === "attacker" && (
                <AttackSpecialBtn
                  target={currentBoss}
                  attackDamage={creature.attack}
                  onClick={() => handleSpecialAttack(creature)}
                  key={`AttackSpecialBtn_${creature.id}`}
                  disabled={attackSpecialDisabled}
                />
              )}
              {creature.type === "defender" && (
                <DefenseSpecialBtn
                  target={currentBoss}
                  attackDamage={creature.attack}
                  onClick={() => handleSpecialAttack(creature)}
                  key={`DefenseSpecialBtn_${creature.id}`}
                  disabled={defenseSpecialDisabled}
                />
              )}
              {creature.type === "trickster" && (
                <TricksterSpecialBtn
                  target={currentBoss}
                  attackDamage={creature.attack}
                  onClick={() => handleSpecialAttack(creature)}
                  key={`attackSpecialBtn_${creature.id}`}
                  disabled={attackTricksterDisabled}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
      <AlertModal
        show={showRetreatModal}
        heading="RETREAT!"
        message="Your Programon passed out! Run away!!!"
        classHeader="game-alert-hd-bg text-white paragraph-text"
        classBody="bg-dark text-white fw-bold"
        classFooter="game-alert-ft-bg"
        handleClose={handleRetreat}
      />
    </>
  );
}
