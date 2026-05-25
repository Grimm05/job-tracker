package com.jobtracker.repository.specification;

import com.jobtracker.entity.Application;
import com.jobtracker.entity.ApplicationStatus;
import org.springframework.data.jpa.domain.Specification;

/*Chaque méthode retourne cb.conjunction() si le paramètre est absent — c'est l'équivalent d'un WHERE 1=1.
La spec est toujours valide, elle ne filtre simplement rien.*/
public class ApplicationSpecification {

    private ApplicationSpecification() {}

    public static Specification<Application> hasStatus(ApplicationStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()                          // pas de filtre
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<Application> hasCompany(String company) {
        return (root, query, cb) ->
                (company == null || company.isBlank())
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("company")),
                        "%" + company.toLowerCase() + "%");
    }

    public static Specification<Application> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();

            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("company")),  pattern),
                    cb.like(cb.lower(root.get("position")), pattern),
                    cb.like(cb.lower(root.get("location")), pattern)
            );
        };
    }

    // Combinateur : toutes les specs ensemble
    public static Specification<Application> buildFilter(
            String keyword,
            String company,
            ApplicationStatus status
    ) {
        return Specification
                .where(hasKeyword(keyword))
                .and(hasCompany(company))
                .and(hasStatus(status));
    }
}