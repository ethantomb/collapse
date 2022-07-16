#North, East, West, and South Tile connection points
#In order: [BLANK,HORIZ,VERT,NtoE,EtoS,StoW,WtoN,QUAD,TNORTH,TEAST,TSOUTH,TWEST]
sockets = [[0,0,0,0],[0,1,0,1],[1,0,1,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,1,1],[1,1,0,1],[1,1,1,0],[0,1,1,1],[1,0,1,1]]

#Generate indecies where each tile can be placed
def generate_connections(sockets):
    connections = []
    for i in range(len(sockets)):
        connections.append([[],[],[],[]])
        for j in range(len(sockets)):

            if sockets[i][0] == sockets[j][2]:
                connections[i][0].append(j)
            if sockets[i][1] == sockets[j][3]:
                connections[i][1].append(j)
            if sockets[i][2] == sockets[j][0]:
                connections[i][2].append(j)
            if sockets[i][3] == sockets[j][1]:
                connections[i][3].append(j)
    return connections

print(generate_connections(sockets))