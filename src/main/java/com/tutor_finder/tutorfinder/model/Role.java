package com.tutor_finder.tutorfinder.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    STUDENT,
    TUTOR,
    ADMIN,
    SUPERADMIN;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Role fromString(String value) {
        if (value == null) {
            return null;
        }
        return Role.valueOf(value.toUpperCase());
    }
}
