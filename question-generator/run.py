import Generator
import json

N = 5


def generate_n_different(obj, n):
    lst = []
    while len(lst) < n:
        if not len(list(filter(lambda x: x.get(obj.question_text), lst))):
            lst.append(obj.to_dict())
            obj.reroll()
    return lst


a = Generator.Addition(1, ["addition"])
s = Generator.Subtraction(1, ["subtraction"])
m = Generator.Multiplication(1, ["multiplication"])
d = Generator.Divison(1, ["division"])

dict_list = []
for diff in range(1, 4):
    a.difficulty = diff
    dict_list += generate_n_different(a, N)

for diff in range(1, 4):
    s.difficulty = diff
    dict_list += generate_n_different(s, N)

for diff in range(1, 4):
    m.difficulty = diff
    dict_list += generate_n_different(m, N)

for diff in range(1, 4):
    d.difficulty = diff
    dict_list += generate_n_different(d, N)

with open("result.txt", "w") as f:
    f.write(json.dumps(dict_list, indent=4))
