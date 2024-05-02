import { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import "./maze.css";
import Confetti from "react-confetti";

const mazeWidthHeight: number = 30;

var root = document.querySelector(":root");
(root as any)?.style?.setProperty("--height", `${mazeWidthHeight}px`);

interface MazeType {
  visited: boolean;
  walls: {
    l: boolean;
    r: boolean;
    t: boolean;
    b: boolean;
  };
  initialNode: boolean;
}

const Pacman = ({ height = "800px", width = "800px" }: any) => {
  // return <img src="/spider.gif" height={height} width={width} />;
  return (
    <img
      width={width}
      height={height}
      src="https://img.icons8.com/fluency-systems-filled/96/spider.png"
      alt="spider"
    />
  );
};

const Maze = () => {
  const [maze, setMaze] = useState<Array<Array<MazeType>>>([]);
  let [pivot, setPivot] = useState([0, 0]);
  const [route, setRoute] = useState<Array<string>>([]);
  const [flag, setFlag] = useState(false);
  const [interval_time, setInterval_time] = useState();

  const [displayPivot, setDisplayPivot] = useState(true);
  const [startGames, setStateGame] = useState(false);
  const [showBuddy, setShowBuddy] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [wantTrail, setWantTrail] = useState(true);
  const [trail, setTrail] = useState<any>([]);
  const [mazeSize, setMazeSize] = useState(6);

  const initialState = [0, 0];
  const finalState = [mazeSize - 1, mazeSize - 1];

  const [currentBuddyPlacement, setCurrentBuddyPlacement] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    createMaze(mazeSize, setMaze);
    setInitialNode(initialState[0], initialState[1], setMaze);
  }, [mazeSize]);

  const createMaze = (
    mazeSize: number,
    setMaze: Dispatch<SetStateAction<Array<Array<MazeType>>>>
  ) => {
    const cellObject: MazeType = {
      visited: false,
      initialNode: false,
      walls: {
        l: true,
        r: true,
        t: true,
        b: true,
      },
    };
    let tempObj: any = [];
    for (let i = 0; i < mazeSize; i++) {
      let temp = [];
      for (let j = 0; j < mazeSize; j++) {
        temp.push({
          ...cellObject,
          walls: {
            l: true,
            r: true,
            t: true,
            b: true,
          },
        });
      }
      tempObj.push(temp);
    }
    setMaze(tempObj);
  };

  const setInitialNode = (
    x: number,
    y: number,
    setMaze: Dispatch<SetStateAction<Array<Array<MazeType>>>>
  ) => {
    if (x < 0 || y < 0 || x > mazeSize - 1 || y > mazeSize - 1) return;
    setMaze((oldVal: Array<Array<MazeType>>) => {
      if (oldVal[x]) {
        oldVal[x][y].initialNode = true;
        oldVal[x][y].visited = true;
      }
      return [...oldVal];
    });
  };
  const checkUnvisitedNeighbour = () => {
    let unvisited: {
      l: boolean | null;
      r: boolean | null;
      t: boolean | null;
      b: boolean | null;
    } = {
      l: false,
      r: false,
      t: false,
      b: false,
    };
    if (
      maze[pivot[0] - 1] &&
      maze[pivot[0] - 1][pivot[1]] &&
      maze[pivot[0] - 1][pivot[1]].visited === false
    ) {
      unvisited.t = true;
    }
    if (
      maze[pivot[0] + 1] &&
      maze[pivot[0] + 1][pivot[1]] &&
      maze[pivot[0] + 1][pivot[1]].visited === false
    ) {
      unvisited.b = true;
    }
    if (
      maze[pivot[0]] &&
      maze[pivot[0]][pivot[1] - 1] &&
      maze[pivot[0]][pivot[1] - 1].visited === false
    ) {
      unvisited.l = true;
    }
    if (
      maze[pivot[0]] &&
      maze[pivot[0]][pivot[1] + 1] &&
      maze[pivot[0]][pivot[1] + 1].visited === false
    ) {
      unvisited.r = true;
    }
    return unvisited;
  };

  const movePivot = (side: string) => {
    setRoute((r: any) => {
      return [...r, side];
    });
    setMaze((m: any) => {
      if (side === "l") {
        m[pivot[0]][pivot[1]].walls.l = false;
        m[pivot[0]][pivot[1] - 1].walls.r = false;
        setPivot([pivot[0], pivot[1] - 1]);
        m[pivot[0]][pivot[1] - 1].visited = true;
      }
      if (side === "r") {
        m[pivot[0]][pivot[1]].walls.r = false;
        m[pivot[0]][pivot[1] + 1].walls.l = false;
        setPivot([pivot[0], pivot[1] + 1]);
        m[pivot[0]][pivot[1] + 1].visited = true;
      }
      if (side === "t") {
        m[pivot[0]][pivot[1]].walls.t = false;
        m[pivot[0] - 1][pivot[1]].walls.b = false;
        setPivot([pivot[0] - 1, pivot[1]]);
        m[pivot[0] - 1][pivot[1]].visited = true;
      }
      if (side === "b") {
        m[pivot[0]][pivot[1]].walls.b = false;
        m[pivot[0] + 1][pivot[1]].walls.t = false;
        setPivot([pivot[0] + 1, pivot[1]]);
        m[pivot[0] + 1][pivot[1]].visited = true;
      }
      return [...m];
    });
  };

  const movePivotToRandomSide = (previousBlock: any) => {
    // here side and movement will be just opposite
    if (previousBlock === "r") {
      setPivot([pivot[0], pivot[1] - 1]);
    }
    if (previousBlock === "l") {
      setPivot([pivot[0], pivot[1] + 1]);
    }
    if (previousBlock === "b") {
      setPivot([pivot[0] - 1, pivot[1]]);
    }
    if (previousBlock === "t") {
      setPivot([pivot[0] + 1, pivot[1]]);
    }
  };

  const handleCreate = () => {
    // find unvisited neighbours
    const neighbourState = checkUnvisitedNeighbour();
    if (Object.values(neighbourState).some((d) => d)) {
      // choose random unvisited if unvisited present
      const unvisitedNeighbour = Object.entries(neighbourState)
        .filter((x) => x[1])
        .map((y) => y[0]);
      const randomSideToMove =
        unvisitedNeighbour[
        Math.floor(Math.random() * unvisitedNeighbour.length)
        ];
      movePivot(randomSideToMove);
    } else {
      // no unvisited present
      // move to previous visited neighbour
      const openSides = route[route.length - 1];
      setRoute(route.slice(0, -1));
      movePivotToRandomSide(openSides);
    }
    if (route.length > 2) {
      setFlag(true);
    }
    if (flag && pivot[0] === initialState[0] && pivot[1] === initialState[1]) {
      clearInterval(interval_time);
      setDisplayPivot(false);
      startGame();
    }
  };

  const start = () => {
    setStateGame(true);
    const interval = setInterval(() => {
      document.getElementById("handleClick")?.click();
    }, 1);
    setInterval_time(interval as any);
  };

  const startGame = () => {
    setShowBuddy(true);
    addEventListn();
  };

  const handleKeyChange = (event: any) => {
    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") {
      setCurrentBuddyPlacement((old) => {
        if (old.y === 0) {
          return { ...old };
        }
        if (maze[old.y][old.x].walls.t) {
          return { ...old };
        }
        return { x: old.x, y: old.y - 1 };
      });
    } else if (key === "arrowdown" || key === "s") {
      setCurrentBuddyPlacement((old) => {
        if (old.y === mazeSize - 1) {
          return { ...old };
        }
        if (maze[old.y][old.x].walls.b) {
          return { ...old };
        }
        return { x: old.x, y: old.y + 1 };
      });
    } else if (key === "arrowleft" || key === "a") {
      setCurrentBuddyPlacement((old) => {
        if (old.x === 0) {
          return { ...old };
        }
        if (maze[old.y][old.x].walls.l) {
          return { ...old };
        }
        return { x: old.x - 1, y: old.y };
      });
    } else if (key === "arrowright" || key === "d") {
      setCurrentBuddyPlacement((old) => {
        if (old.x === mazeSize - 1) {
          return { ...old };
        }
        if (maze[old.y][old.x].walls.r) {
          return { ...old };
        }
        return { x: old.x + 1, y: old.y };
      });
    }
  };

  const [swipeCoords, setSwipeCoords] = useState({
    x: 0,
    y: 0,
  });

  const resetGame = () => {
    // setMaze([]);
    // setPivot([0, 0]);
    // setRoute([]);
    // setFlag(false);
    // setDisplayPivot(true);
    // setStateGame(false);
    // setGameComplete(false);
    // setTrail([]);
    // setMazeSize(6);
    // setCurrentBuddyPlacement({ x: 0, y: 0 });
    // createMaze(mazeSize, setMaze);
    // setInitialNode(initialState[0], initialState[1], setMaze);
    window.location.reload();
  };

  const keyRef = useRef(swipeCoords);

  useEffect(() => {
    keyRef.current = swipeCoords;
  }, [swipeCoords]);

  // const changePosition = useDebouncedCallback((x, y) => {
  const changePosition = (x: any, y: any) => {
    const xDel = x - keyRef.current.x;
    const yDel = y - keyRef.current.y;

    const xgreater = Math.abs(xDel) - Math.abs(yDel) > 0;

    if (xgreater) {
      // horizontal
      if (xDel > 0) {
        setCurrentBuddyPlacement((old) => {
          if (old.x === mazeSize - 1) {
            return { ...old };
          }
          if (maze[old.y][old.x].walls.r) {
            return { ...old };
          }
          return { x: old.x + 1, y: old.y };
        });
      } else {
        setCurrentBuddyPlacement((old) => {
          if (old.x === 0) {
            return { ...old };
          }
          if (maze[old.y][old.x].walls.l) {
            return { ...old };
          }
          return { x: old.x - 1, y: old.y };
        });
      }
    } else {
      // vertical
      if (yDel > 0) {
        setCurrentBuddyPlacement((old) => {
          if (old.y === mazeSize - 1) {
            return { ...old };
          }
          if (maze[old.y][old.x].walls.b) {
            return { ...old };
          }
          return { x: old.x, y: old.y + 1 };
        });
      } else {
        setCurrentBuddyPlacement((old) => {
          if (old.y === 0) {
            return { ...old };
          }
          if (maze[old.y][old.x].walls.t) {
            return { ...old };
          }
          return { x: old.x, y: old.y - 1 };
        });
      }
    }
  };

  //   // setSwipeCoords({ x, y });
  // }, 200);

  const handleTouchStart = (event: any) => {
    const { pageX, pageY } = event.changedTouches[0];
    setSwipeCoords({ x: pageX, y: pageY });
  };

  const handleTouchEnd = (event: any) => {
    const { pageX, pageY } = event.changedTouches[0];
    changePosition(pageX, pageY);
  };

  const addEventListn = () => {
    document.addEventListener("keydown", handleKeyChange);
    // document.addEventListener("touchmove", handleSwipe);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    if (
      currentBuddyPlacement.x == finalState[0] &&
      currentBuddyPlacement.y === finalState[1]
    ) {
      setGameComplete(true);
    }
    setTrail((old: string[]) => {
      if (
        old[old?.length - 1] ===
        `${currentBuddyPlacement.x}-${currentBuddyPlacement.y}`
      ) {
        return [...old];
      }
      old.push(`${currentBuddyPlacement.x}-${currentBuddyPlacement.y}`);
      return [...old];
    });

  }, [currentBuddyPlacement]);

  const getOpacity = (x: number, y: number) => {
    let temp = `${x}-${y}`;
    const a = trail.filter((_: any) => _ == temp);
    if (a?.length) {
      return 0.3 * a.length;
    }
    return 0;
  };

  return (
    <>
      <Confetti numberOfPieces={400} gravity={0.1} drawShape={(x) => { }} />

      {!startGames ? (
        <div className="startGame">
          <Pacman height={120} width={120} />
          <div className="submit">
            <div>
              <span>
                <input
                  type="radio"
                  name="difficulty"
                  value={6}
                  onChange={(e) => setMazeSize(Number(e.target.value))}
                  checked={mazeSize == 6}
                  style={{
                    accentColor: "#a1c398",
                  }}
                />
                easy
              </span>
              <span>
                <input
                  type="radio"
                  name="difficulty"
                  value={10}
                  onChange={(e) => setMazeSize(Number(e.target.value))}
                  checked={mazeSize == 10}
                  style={{
                    accentColor: "#a1c398",
                  }}
                />
                medium
              </span>
              <span>
                <input
                  type="radio"
                  name="difficulty"
                  value={15}
                  onChange={(e) => setMazeSize(Number(e.target.value))}
                  checked={mazeSize == 15}
                  style={{
                    accentColor: "#a1c398",
                  }}
                />
                hard
              </span>
            </div>
            <button onClick={start}>Create Maze </button>
          </div>
          <p>Create your own game maze and play</p>
        </div>
      ) : !gameComplete ? (
        <div className="game">
          <div
            className="box"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {maze.map((row, i) => {
              return (
                <div key={i} className="row">
                  {row.map((col, j) => {
                    return (
                      <div
                        className={`block ${col.walls.b && "bb"} ${col.walls.t && "bt"
                          } ${col.walls.l && "bl"} ${col.walls.r && "br"} ${pivot[0] == i &&
                          pivot[1] == j &&
                          displayPivot &&
                          "pivot"
                          } ${col.visited && "visited"} ${initialState[0] == i &&
                          initialState[1] == j &&
                          "startPoint"
                          }  ${finalState[0] == i && finalState[1] == j && "endPoint"
                          }`}
                      >
                        <div
                          style={{
                            background: "#C6EBC5",
                            opacity: getOpacity(j, i),
                            height: "100%",
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {!displayPivot && (
              <div
                className="buddy"
                style={{
                  top: `${currentBuddyPlacement.y * mazeWidthHeight}px`,
                  left: `${currentBuddyPlacement.x * mazeWidthHeight}px`,
                }}
              >
                <Pacman height="70%" width="70%" />
              </div>
            )}
          </div>

          {/* start button  */}
          <button
            onClick={() => {
              setTrail([]);
              setCurrentBuddyPlacement({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="wonWrapper">
          {/* // game won button  */}
          <div className="won">You won</div>
          <button className="reload" onClick={resetGame}>
            Play Again
          </button>
          <Confetti numberOfPieces={400} gravity={0.1} />
        </div>
      )}
      <button id="handleClick" onClick={handleCreate}>
        Create
      </button>
      <p style={{ position: 'fixed', bottom: '18px', textAlign: 'center', width: '100%', fontSize: '14px', color: '#a3a3a3' }}>Anurag &#169; 2024 </p>
    </>
  );
};

export default Maze;
