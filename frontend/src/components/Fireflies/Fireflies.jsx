import React, { useEffect } from 'react';

const Fireflies = () => {
    useEffect(() => {
        // Numero di lucciole da creare - legge il valore dalla variabile CSS
        const quantity = getComputedStyle(document.documentElement).getPropertyValue('--quantity').trim() || 20;

        // Funzione per generare un numero casuale all'interno di un intervallo
        const getRandomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Rimuovi eventuali lucciole precedenti
        const existingFireflies = document.querySelectorAll('.firefly');
        existingFireflies.forEach(fly => fly.remove());
        // Array di animazioni per il movimento
        const moveAnimations = ['move1', 'move2', 'move3', 'move4', 'move5', 'move6', 'move7', 'move8', 'move9', 'move10', 'move11', 'move12'];

        // Crea le lucciole
        for (let i = 1; i <= quantity; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';

            // Seleziona un'animazione casuale per il movimento
            const randomMoveAnimation = moveAnimations[getRandomInt(0, moveAnimations.length - 1)];

            // Imposta stili e animazioni casuali
            firefly.style.animationName = randomMoveAnimation;
            firefly.style.animationDuration = `${getRandomInt(10, 25)}s`;
            firefly.style.animationDelay = `${getRandomInt(0, 20)}s`;

            document.body.appendChild(firefly);

            // Imposta animazioni per drift e flash con tempi casuali
            const fireflyBefore = document.createElement('style');
            const fireflyAfter = document.createElement('style');

            const driftDuration = getRandomInt(10, 20);
            const flashDuration = getRandomInt(3, 8);

            fireflyBefore.innerHTML = `
        .firefly:nth-child(${i})::before {
          animation-duration: ${driftDuration}s;
        }
      `;

            fireflyAfter.innerHTML = `
        .firefly:nth-child(${i})::after {
          animation-duration: ${driftDuration}s, ${flashDuration}s;
          animation-delay: 0s, ${getRandomInt(0, flashDuration)}s;
        }
      `;

            document.head.appendChild(fireflyBefore);
            document.head.appendChild(fireflyAfter);
        }

        // Cleanup al momento dell'unmount del componente
        return () => {
            const fireflies = document.querySelectorAll('.firefly');
            fireflies.forEach(fly => fly.remove());

            // Rimuovi gli stili aggiunti
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
                if (style.innerHTML.includes('.firefly:nth-child')) {
                    style.remove();
                }
            });
        };
    }, []);

    return null; // Questo componente non renderizza nulla visivamente
};

export default Fireflies;
