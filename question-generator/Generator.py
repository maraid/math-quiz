import random
import decimal


class Question:
    def __init__(self, question_text, difficulty, tags):
        assert isinstance(question_text, str), question_text
        assert difficulty in (1, 2, 3), difficulty
        assert isinstance(tags, list), tags

        self._question_text = question_text
        self._difficulty = difficulty
        self._tags = tags

    @property
    def question_text(self):
        return self._question_text

    @property
    def difficulty(self):
        return self._difficulty

    @difficulty.setter
    def difficulty(self, value):
        assert value in (1, 2, 3), value
        self._difficulty = value

    @property
    def tags(self):
        return self._tags

    @tags.setter
    def tags(self, value):
        assert isinstance(value, list), value
        self._tags = value

    def __eq__(self, other):
        return self.question_text == other.question_text


class TwoOperand(Question):
    def __init__(self, difficulty, tags, operand1=None, operand2=None):
        super().__init__("", difficulty, tags)
        self.operand1 = operand1 if operand1 is not None else self.rand()
        self.operand2 = operand2 if operand1 is not None else self.rand()

    @property
    def difficulty_modifier(self):
        raise NotImplementedError("Must override difficulty_modifier")

    @property
    def operand_text(self):
        raise NotImplementedError("Must override operand_text")

    def reroll(self):
        self.operand1 = self.rand()
        self.operand2 = self.rand()

    @staticmethod
    def random_n_digits_int(n):
        range_start = 10 ** (n - 1)
        range_end = (10 ** n) - 1
        return random.randint(range_start, range_end)

    @classmethod
    def generate_random(cls, difficulty, tags):
        obj = cls(difficulty, tags)
        return obj.to_dict()

    def rand(self):
        a = self.random_n_digits_int(self.difficulty_modifier[self.difficulty - 1])
        print("rand result: ", a, "\ndifficulty: ", self.difficulty, "\nmod: ", self.difficulty_modifier)
        return a

    @property
    def question_text(self):
        return " ".join((str(self.operand1), self.operand_text, str(self.operand2), "=", "?"))

    def execute(self, op1, op2):
        pass

    @property
    def correct_answer(self):
        return self.execute(self.operand1, self.operand2)

    def incorrect_answer(self, diff=0.3):
        false_op1 = int(random.uniform(self.operand1 * (1.0 - diff), self.operand1 * (1.0 + diff)))
        false_op2 = int(random.uniform(self.operand2 * (1.0 - diff), self.operand2 * (1.0 + diff)))
        return self.execute(false_op1, false_op2)

    def answers(self):
        lst = [round(self.correct_answer, 2)]
        while len(lst) < 4:
            temp = round(self.incorrect_answer(), 2)
            if temp not in lst:
                lst.append(temp)
        return lst

    def to_dict(self):
        d = dict(question=self.question_text,
                 answers=self.answers(),
                 difficulty=self.difficulty,
                 tags=self.tags)
        return d

    def __str__(self):
        return "operand1 = " + str(self.operand1) + \
               "\noperand2 = " + str(self.operand2)


class Addition(TwoOperand):
    def __init__(self, difficulty, tags, difficulty_modifier=[2, 3, 5], *args, **kwargs):
        self._difficulty_modifier = difficulty_modifier
        self._operand_text = "+"
        super().__init__(difficulty, tags, *args, **kwargs)

    @property
    def difficulty_modifier(self):
        return self._difficulty_modifier

    @property
    def operand_text(self):
        return self._operand_text

    def execute(self, op1, op2):
        return op1 + op2


class Subtraction(TwoOperand):
    def __init__(self, difficulty, tags, difficulty_modifier=[2, 3, 5], *args, **kwargs):
        self._difficulty_modifier = difficulty_modifier
        self._operand_text = "-"
        super().__init__(difficulty, tags, *args, **kwargs)

    @property
    def difficulty_modifier(self):
        return [2, 3, 5]

    @property
    def operand_text(self):
        return self._operand_text

    def execute(self, op1, op2):
        return op1 - op2


class Multiplication(TwoOperand):
    def __init__(self, difficulty, tags, difficulty_modifier=[2, 3, 4], *args, **kwargs):
        self._difficulty_modifier = difficulty_modifier
        self._operand_text = "*"
        super().__init__(difficulty, tags, *args, **kwargs)

    @property
    def difficulty_modifier(self):
        return self._difficulty_modifier

    @property
    def operand_text(self):
        return self._operand_text

    def execute(self, op1, op2):
        return op1 * op2


class Divison(TwoOperand):
    def __init__(self, difficulty, tags, difficulty_modifier=[2, 3, 4], *args, **kwargs):
        self._difficulty_modifier = difficulty_modifier
        self._operand_text = "/"
        super().__init__(difficulty, tags, *args, **kwargs)

    @property
    def difficulty_modifier(self):
        return self._difficulty_modifier

    @property
    def operand_text(self):
        return self._operand_text

    def execute(self, op1, op2):
        return op1 / op2


